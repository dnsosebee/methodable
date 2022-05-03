import React, { useContext } from "react";
import { Context } from "./ContextBlock";
import { BlockId, HierarchyIndex, HumanText, IBlock, IState } from "../../model/state/stateTypes";
import { BlockText, IBlockTextProps } from "./BlockText";
import { ITypeSelectProps, TypeSelect } from "./TypeSelect";
import { BlockHandle, IBlockHandleProps } from "./BlockHandle";
import { hIndexEquals } from "../../lib/helpers";
import { ActionType } from "../../model/state/actions";

export interface IBlockProps {
  id: BlockId;
  humanText: HumanText;
  isShallowSelected: boolean;
  isDeepSelected: boolean;
  isGlobalSelectionActive: boolean;
  children: BlockId[];
  hIndex: HierarchyIndex;
}

export const Block = (props: IBlockProps) => {
  const { state, dispatch }: { state: IState; dispatch: (action: ActionType) => {} } =
    useContext(Context);

  const getChildBlocks = (
    children: BlockId[],
    blocksMap: Map<BlockId, IBlock>,
    isGlobalSelectionActive: boolean
  ) => {
    return children.map((childId, childIndex) => {
      const childBlock: IBlock = blocksMap.get(childId);
      const childHIndex = [...props.hIndex, childIndex];
      const childBlockProps = {
        id: childId,
        humanText: childBlock.humanText,
        children: childBlock.children,
        hIndex: childHIndex,
        isGlobalSelectionActive,
        ...getSelectednessInfo(childHIndex),
      };
      return <Block key={childIndex} {...childBlockProps} />;
    });
  };

  const getSelectednessInfo = (
    hierarchyIndex: HierarchyIndex
  ): {
    isShallowSelected: boolean;
    isDeepSelected: boolean;
  } => {
    let isShallowSelected = false;
    let isDeepSelected = false;
    if (state.isSelectionActive) {
      // we know something is selected, nothing more
      if (state.activeParentIndex.length < hierarchyIndex.length) {
        // we know the selection is higher than this block, nothing more
        if (
          hIndexEquals(
            hierarchyIndex.slice(0, state.activeParentIndex.length),
            state.activeParentIndex
          )
        ) {
          // we know the selection is on children of this block's parent, nothing more
          const parentLength = state.activeParentIndex.length;
          const childIndex = hierarchyIndex[parentLength];
          const bound1 = state.selectionRange.start[parentLength];
          const bound2 = state.selectionRange.end[parentLength];
          if (
            (childIndex >= bound1 && childIndex <= bound2) ||
            (childIndex <= bound1 && childIndex >= bound2)
          ) {
            // we know this block or its parent is selected, nothing more (sufficient for deep selection)
            if (state.isSelectionDeep) {
              isDeepSelected = true;
            } else if (parentLength + 1 === hierarchyIndex.length) {
              isShallowSelected = true;
            }
          }
        }
      }
    }
    return { isShallowSelected, isDeepSelected };
  };

  const childBlocks = getChildBlocks(props.children, state.blocksMap, state.isSelectionActive);

  const blockTextProps: IBlockTextProps = {
    id: props.id,
    humanText: props.humanText,
    hIndex: props.hIndex,
    isGlobalSelectionActive: props.isGlobalSelectionActive,
    isDeepSelected: props.isDeepSelected,
  };

  const typeSelectProps: ITypeSelectProps = {
    id: props.id,
    blockType: state.blocksMap.get(props.id).blockType,
  };

  const blockHandleProps: IBlockHandleProps = {
    id: props.id,
    hIndex: props.hIndex,
  };

  return (
    <div>
      <div className="flex">
        <BlockHandle {...blockHandleProps} />
        <TypeSelect {...typeSelectProps}></TypeSelect>
        &nbsp;
        <BlockText {...blockTextProps} />
      </div>
      {childBlocks.length > 0 && (
        <div className="flex">
          <div className="w-1 mr-3 bg-gray-300 my-1 rounded-sm"></div>
          <div className="flex-grow">{childBlocks}</div>
        </div>
      )}
    </div>
  );
};
