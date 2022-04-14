import React, {
  useContext,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Dispatch } from "./ContextBlock";
import { IBlock } from "../../model/state/stateTypes";
import {
  IAction,
  IChangeSelectionAction,
  IMouseDownAction,
  IStartSelectionAction,
} from "../../model/state/actionTypes";
import { logMouseEvent } from "../../lib/loggers";

const Block = (props: IBlock) => {
  const dispatch: (action: IAction) => null = useContext(Dispatch);
  let clickOriginatedInThisText = useRef(false); // whether the current click started in this text

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

  const childBlocks = [];
  for (let i = 0; i < props.children.length; i++) {
    childBlocks.push(<Block {...props.children[i]} key={i} />);
  }

  const selectedClasses = "bg-gray-200 text-gray-700";
  const unselectedClasses = "text-gray-700";

  return (
    <div>
      <div className="flex">
        <div className="h-6 w-6 bg-yellow-300 border border-yellow-700"></div>
        <p
          className={`select-none flex-grow ${props.selected ? selectedClasses : unselectedClasses}`}
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

export { Block };
