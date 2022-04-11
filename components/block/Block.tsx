import React from "react";
import { EditorContent, NodeViewWrapper, useEditor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import BlockExtension from "./BlockExtension";
import History from "@tiptap/extension-history";

const Block = (props) => {
  const subrender = Math.random() > 0.6;

  const click = () => {
    console.log("onClick " + props.num);
  };

  const drag = () => {
    console.log("onDrag " + props.num);
  };

  const dragEnd = () => {
    console.log("onDragEnd " + props.num);
  };

  const dragEnter = () => {
    console.log("onDragEnter " + props.num);
  };
  
  const dragExit = () => {
    console.log("onDragExit " + props.num);
  };

  const dragLeave = () => {
    console.log("onDragLeave " + props.num);
  };

  const dragOver = () => {
    console.log("onDragOver " + props.num);
  };

  const dragStart = () => {
    console.log("onDragStart " + props.num);
  };

  const mouseEnter = () => {
    console.log("onMouseEnter " + props.num);
  };

  const mouseLeave = () => {
    console.log("onMouseLeave " + props.num);
  };

  const mouseDown = () => {
    console.log("onMouseDown")
  }

  return (
    <div className="bg-red-300 pl-2">
      <p
        onClick={click}
        onDrag={drag}
        onDragEnd={dragEnd}
        onDragEnter={dragEnter}
        onDragExit={dragExit}
        onDragLeave={dragLeave}
        onDragOver={dragOver}
        onDragStart={dragStart}
        onMouseEnter={mouseEnter}
        onMouseLeave={mouseLeave}
      >
        {props.num}
      </p>
      {subrender && (
        <>
          <Block num={props.num + 1} />
          <Block num={props.num + 1.1} />
        </>
      )}
    </div>
  );
};

export default Block;
