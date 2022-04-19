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

export interface IBlockProps {
  id: BlockId;
  humanText: HumanText;
  shallowSelected: boolean;
  deepSelected: boolean;
  children: BlockId[];
  index: HierarchyIndex;
}

export const Block = (props: IBlockProps) => {
  const {
    state,
    dispatch,
  }: { state: IState; dispatch: (action: IAction) => {} } = useContext(Context);
  let clickOriginatedInThisText = useRef(false); // whether the current click/drag started in this text

  const click = () => {
    // TODO: This should change to edit mode for the block
    logMouseEvent("onClick " + props.humanText);
  };

  const mouseEnter = (e: React.MouseEvent) => {
    if (isMouseDown(e)) {
      const action: IChangeSelectionAction = {
        type: "selection change",
        index: props.index,
      };
      dispatch(action);
      logMouseEvent("onMouseEnter mouseIsDown " + props.humanText);
    } else {
      logMouseEvent("onMouseEnter mouseisUp " + props.humanText);
    }
  };

  const isMouseDown = (e: React.MouseEvent): boolean => {
    return (e.buttons & 1) === 1;
  };

  const mouseLeave = (e: React.MouseEvent) => {
    if (isMouseDown(e)) {
      if (clickOriginatedInThisText.current) {
        const action: IStartSelectionAction = {
          type: "selection start",
          index: props.index,
        };
        dispatch(action);
      }
      logMouseEvent("onMouseLeave mouseIsDown " + props.humanText);
    } else {
      logMouseEvent("onMouseLeave mouseisUp " + props.humanText);
    }
    clickOriginatedInThisText.current = false;
  };

  const mouseDown = () => {
    clickOriginatedInThisText.current = true;
    const action: IMouseDownAction = {
      type: "mouse down",
      index: props.index,
    };
    dispatch(action);
    logMouseEvent("onMouseDown " + props.humanText);
  };

  const mouseUp = () => {
    clickOriginatedInThisText.current = false;
    logMouseEvent("onMouseUp " + props.humanText);
  };

  const copy = () => {
    logMouseEvent("onCopy " + props.humanText);
  };

  const mouseEvents = {
    onClick: click,
    onMouseEnter: mouseEnter,
    onMouseLeave: mouseLeave,
    onMouseDown: mouseDown,
    onMouseUp: mouseUp,
    onCopy: copy,
  };

  const getChildBlocks = (
    children: BlockId[],
    blocksMap: Map<BlockId, IBlock>
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
        ...getSelectednessInfo(childHierarchyIndex),
      };
      return <Block key={childIndex} {...childBlockProps} />;
    });
  };

  const getSelectednessInfo = (
    hierarchyIndex: HierarchyIndex
  ): {
    shallowSelected: boolean;
    deepSelected: boolean;
  } => {
    let shallowSelected = false;
    let deepSelected = false;
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
              deepSelected = true;
            } else if (parentLength + 1 === hierarchyIndex.length) {
              shallowSelected = true;
            }
          }
        }
      }
    }
    return { shallowSelected, deepSelected };
  };

  const childBlocks = getChildBlocks(props.children, state.blocksMap);

  const selectedClasses = "bg-gray-200 text-gray-700";
  const unselectedClasses = "text-gray-700";

  return (
    <div>
      <div className="flex">
        <div className="h-6 w-6 bg-yellow-300 border border-yellow-700"></div>
        <p
          className={`select-none flex-grow ${
            props.deepSelected ? selectedClasses : unselectedClasses
          }`}
          {...mouseEvents}
        >
          {props.humanText}
        </p>
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
