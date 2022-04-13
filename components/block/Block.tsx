import React, { useImperativeHandle, useRef, useState } from "react";
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

const Block = React.forwardRef((props: BlockProps, ref) => {
  const subrender = Math.random() > 0.7;
  let clickOriginatedHere = useRef(false); // whether the current click started in this component
  let isSelectionParent = useRef(false);
  let selectionStartChildNumber = useRef(0);
  let selectionEndChildNumber = useRef(0);
  let [isSelected, setIsSelected] = useState(false);

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

  const isMouseDown = (e: React.MouseEvent): boolean => {
    return (e.buttons & 1) === 1;
  };

  const mouseLeave = (e: React.MouseEvent) => {
    if (isMouseDown(e)) {
      if (clickOriginatedHere.current) {
        props.selectionStartCallback();
      }
      console.log("onMouseLeave mouseIsDown " + props.tempNum);
    } else {
      console.log("onMouseLeave mouseisUp " + props.tempNum);
    }
    isSelectionParent.current = false;
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
  const selectionStartFromChild = (childNum: number) => {
    return () => {
      isSelectionParent.current = true;
      selectionStartChildNumber.current = childNum;
      selectionEndChildNumber.current = childNum;
      console.log(
        "Selection started for " +
          props.tempNum +
          ": new start child is #" +
          childNum
      );
    };
  };

  const selectionChangeFromChild = (childNum: number) => {
    return () => {
      if (isSelectionParent.current) {
        selectionEndChildNumber.current = childNum;
        console.log(
          "Selection changed for " +
            props.tempNum +
            ": new end child is #" +
            childNum
        );
        propagateSelection(true);
      }
    };
  };

  const mouseEvents = {
    onClick: click,
    onMouseEnter: mouseEnter,
    onMouseLeave: mouseLeave,
    onMouseDown: mouseDown,
    onMouseUp: mouseUp,
    onCopy: copy,
  };

  //   // Is n between these two bounds? bounds can be in ascending or descending order.
  //   const inclusiveBetween = (n: number, bound1: number, bound2: number): boolean => {
  //     const betweenAscending = n >= bound1 && n <= bound2;
  //     const betweenDescending = n <= bound1 && n >= bound2;
  //     return betweenAscending || betweenDescending;
  //   }

  // const shouldPropagateSelectedness = (childNum: number) => {
  //   const selectedBySelf = isSelectionParent.current && inclusiveBetween(childNum, selectionStartChildNumber.current, selectionEndChildNumber.current)
  //   return !props.definitelyNotSelected && (props.selectedByParent || selectedBySelf)
  // }

  const childRefs = [];
  const childBlocks = [];
  if (subrender) {
    for (let i = 0; i < 3; ++i) {
      childRefs.push(useRef());
    }
    for (let i = 0; i < 3; ++i) {
      childBlocks.push(
        <Block
          key={i}
          ref={childRefs[i]}
          selectionStartCallback={selectionStartFromChild(i)}
          selectionChangeCallback={selectionChangeFromChild(i)}
          tempNum={props.tempNum + (1 * 10 ** -i)}
        />
      );
    }
  }

  useImperativeHandle(ref, () => ({
    propagateSelection: (selected: boolean) => {propagateSelection(selected)},
  }));

  const propagateSelection = (selected: boolean) => {
    setIsSelected(selected)
    childRefs.forEach((ref) => {
      ref.current.propagateSelection(selected)
    });
  }

  return (
    <div className="bg-red-300 border border-red-700" {...mouseEvents}>
      <div className="flex border border-black">
        <div className="h-6 w-6 bg-yellow-300 border border-yellow-700"></div>
        <p className={`select-none flex-grow ${isSelected ? "bg-white-500" : ""}`}>{props.tempNum}</p>
      </div>
      {subrender && (
        <div className="flex">
          <div className="bg-blue-300 w-6 border border-blue-700"></div>
          <div className="flex-grow">{childBlocks}</div>
        </div>
      )}
    </div>
  );
});

export { Block };
export type { BlockProps };
