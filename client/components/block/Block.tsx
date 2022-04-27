import React, { useContext, useRef } from "react";
import { Context } from "./ContextBlock";
import { BlockId, HierarchyIndex, HumanText, IBlock, IState } from "../../model/state/stateTypes";
import { IAction } from "../../model/state/actionTypes";
import { BlockText, IBlockTextProps } from "./BlockText";

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
  const { state, dispatch }: { state: IState; dispatch: (action: IAction) => {} } =
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
      return (
        <div className="flex">
          <div>
            <p>{childIndex + 1}.&nbsp;</p>
          </div>
          <div className="flex-grow">
            <Block key={childIndex} {...childBlockProps} />
          </div>
        </div>
      );
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
          hierarchyIndex.slice(0, state.activeParentIndex.length).join(".") ===
          state.activeParentIndex.join(".")
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

  return (
    <div>
      <div className="flex">
        <BlockText {...blockTextProps} />
      </div>
      {childBlocks.length > 0 && (
        <div className="flex">
          <div className="w-1 mr-3 bg-gray-300"></div>
          <div className="flex-grow">{childBlocks}</div>
        </div>
      )}
    </div>
  );
};
