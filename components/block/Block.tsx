import React, { useRef } from "react";
import { EditorContent, NodeViewWrapper, useEditor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import History from "@tiptap/extension-history";

interface BlockProps {
  tempNum: number;
  selectionStartCallback?: (isSelectedBlock: boolean) => void;
  selectionChangeCallback?: () => void;
  selectionEndCallback?: () => void;
}

const Block = (props: BlockProps) => {
  const subrender = Math.random() > 0.7;
  let clickOriginatedHere = useRef(false); // whether the current click started in this component
  let isAncestorOfSelectionStart = useRef(false);
  let isParentOfSelectionStart = useRef(false);
  let isParentOfEntireSelection = useRef(false);
  const isMouseDown = (e: React.MouseEvent): boolean => {
    return (e.buttons & 1) === 1;
  };

  const click = () => {
    // TODO: This should change to edit mode for the block
    console.log("onClick " + props.tempNum);
  };

  const mouseEnter = (e: React.MouseEvent) => {
    if (isMouseDown(e)) {
      props.selectionChangeCallback();
      console.log("onMouseEnter mouseIsDown " + props.tempNum);

    } else {
      console.log("onMouseEnter mouseisUp " + props.tempNum);
    }
  };

  const mouseLeave = (e: React.MouseEvent) => {
    if (isMouseDown(e)) {
      if (clickOriginatedHere.current) {
        props.selectionStartCallback(true);
      }
      console.log("onMouseLeave mouseIsDown " + props.tempNum);
    } else {
      console.log("onMouseLeave mouseisUp " + props.tempNum);
    }
    clickOriginatedHere.current = false;
  };

  const mouseDown = () => {
    clickOriginatedHere.current = true;
    console.log("onMouseDown " + props.tempNum);
  };

  const mouseUp = () => {
    clickOriginatedHere.current = false;
    console.log("onMouseUp " + props.tempNum);
  };

  const copy = () => {
    console.log("onCopy " + props.tempNum);
  };

  // isSelectedBlock: whether the callback is coming directly from the block that was selected
  const selectionStartFromChild = (isSelectedBlock: boolean) => {
    if (isSelectedBlock) {
      isParentOfSelectionStart.current = true;
    }
    isAncestorOfSelectionStart.current = true;
    props.selectionStartCallback(false);
    console.log("Selection started")
  }

  const selectionChangeFromChild = () => {
    if (isAncestorOfSelectionStart.current) {
      isParentOfEntireSelection.current = true;
      console.log("The parent of the selection is: " + props.tempNum)
    } else {
      props.selectionChangeCallback();
    }
    console.log("Selection changed")
  }

  return (
    <div className="bg-red-300">
      <div className="flex">
        <div className="h-6 w-6 bg-yellow-300 border border-black"></div>
        <p
          className="select-none flex-grow"
          onClick={click}
          onMouseEnter={mouseEnter}
          onMouseLeave={mouseLeave}
          onMouseDown={mouseDown}
          onMouseUp={mouseUp}
          onCopy={copy}
        >
          {props.tempNum}
        </p>
      </div>
      {subrender && (
        <div className="flex">
          <div className="bg-blue-300 w-6 border border-black"></div>
          <div>
            <Block selectionStartCallback={selectionStartFromChild} selectionChangeCallback={selectionChangeFromChild} tempNum={props.tempNum + 1} />
            <Block selectionStartCallback={selectionStartFromChild} selectionChangeCallback={selectionChangeFromChild} tempNum={props.tempNum + 1.1} />
            <Block selectionStartCallback={selectionStartFromChild} selectionChangeCallback={selectionChangeFromChild} tempNum={props.tempNum + 1.01} />
          </div>
        </div>
      )}
    </div>
  );
};

export { Block };
export type { BlockProps };
