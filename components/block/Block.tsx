import React from "react";
import { EditorContent, NodeViewWrapper, useEditor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import History from "@tiptap/extension-history";

interface BlockProps {
  tempNum: number;
  selectionStartCallback?: () => void;
  selectionChangeCallback?: () => void;
  selectionEndCallback?: () => void;
}

const Block = (props: BlockProps) => {
  const subrender = Math.random() > 0.7;

  const isMouseDown = (e: React.MouseEvent): boolean => {
    return (e.buttons & 1) === 1;
  };

  const click = () => {
    // TODO: This should change to edit mode for the block
    console.log("onClick " + props.tempNum);
  };

  const mouseEnter = (e: React.MouseEvent) => {
    if (isMouseDown(e)) {
      console.log("onMouseEnter mouseIsDown " + props.tempNum);
    } else {
      console.log("onMouseEnter mouseisUp " + props.tempNum);
    }
  };

  const mouseLeave = (e: React.MouseEvent) => {
    if (isMouseDown(e)) {
      console.log("onMouseLeave mouseIsDown " + props.tempNum);
    } else {
      console.log("onMouseLeave mouseisUp " + props.tempNum);
    }
  };

  const mouseDown = () => {
    console.log("onMouseDown " + props.tempNum);
  };

  const mouseUp = () => {
    console.log("onMouseUp " + props.tempNum);
  };

  const copy = () => {
    console.log("onCopy " + props.tempNum);
  };

  return (
    <div className="bg-red-300">
      <div className="flex">
        <div className="h-6 w-6 bg-yellow-300 border border-black"></div>
        <p
          className="select-none"
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
            <Block tempNum={props.tempNum + 1} />
            <Block tempNum={props.tempNum + 1.1} />
            <Block tempNum={props.tempNum + 1.01} />
          </div>
        </div>
      )}
    </div>
  );
};

export { Block };
export type { BlockProps };
