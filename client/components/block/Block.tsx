import React, { useContext, useRef } from "react";
import { Context } from "./ContextBlock";
import {
  BlockId,
  HierarchyIndex,
  HumanText,
  IBlock,
  IState,
} from "../../model/state/stateTypes";
import {
  IAction,
  IChangeSelectionAction,
  IMouseDownAction,
  IStartSelectionAction,
} from "../../model/state/actionTypes";
import { logMouseEvent } from "../../lib/loggers";
import { BlockText, IBlockTextProps } from "./BlockText";

export interface IBlockProps {
  id: BlockId;
  humanText: HumanText;
  isShallowSelected: boolean;
  isDeepSelected: boolean;
  isGlobalSelectionActive: boolean;
  children: BlockId[];
  index: HierarchyIndex;
}

export const Block = (props: IBlockProps) => {
  const {
    state,
    dispatch,
  }: { state: IState; dispatch: (action: IAction) => {} } = useContext(Context);

  const getChildBlocks = (
    children: BlockId[],
    blocksMap: Map<BlockId, IBlock>,
    isGlobalSelectionActive: boolean,
  ) => {
    return children.map((childId, childIndex) => {
      const childBlock: IBlock = blocksMap.get(childId);
      const childHierarchyIndex = JSON.parse(
        JSON.stringify(props.index)
      ).concat(childIndex);
      const childBlockProps = {
        id: childId,
        humanText: childBlock.humanText,
        children: childBlock.children,
        index: childHierarchyIndex,
        isGlobalSelectionActive,
        ...getSelectednessInfo(childHierarchyIndex),
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
    index: props.index,
    isGlobalSelectionActive: props.isGlobalSelectionActive,
    isDeepSelected: props.isDeepSelected,
  }

  return (
    <div>
      <div className="flex">
        <div className="h-6 w-6 bg-yellow-300 border border-yellow-700"></div>
        {/* <p
          className={`select-none flex-grow ${
            props.deepSelected ? selectedClasses : unselectedClasses
          }`}
          {...mouseEvents}
        >
          {props.humanText}
        </p> */}
        <BlockText {...blockTextProps} />
      </div>
      {childBlocks.length > 0 && (
        <div className="flex">
          <div className="bg-red-300 w-6 border border-red-700"></div>
          <div className="flex-grow">{childBlocks}</div>
        </div>
      )}
    </div>
  );
};
