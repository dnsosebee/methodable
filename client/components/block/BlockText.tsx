import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import { useContext, useRef } from "react";
import { logMouseEvent } from "../../lib/loggers";
import {
  IAction,
  IChangeSelectionAction,
  IMouseDownAction,
  IStartSelectionAction,
} from "../../model/state/actionTypes";
import { HierarchyIndex, IState } from "../../model/state/stateTypes";
import { Context } from "./ContextBlock";

export interface IBlockTextProps {
  humanText: string;
  index: HierarchyIndex;
  isDeepSelected: boolean;
  isShallowSelected: boolean;
}

export const BlockText = (props: IBlockTextProps) => {
  let clickOriginatedInThisText = useRef(false); // whether the current click/drag started in this text
  const {
    state,
    dispatch,
  }: { state: IState; dispatch: (action: IAction) => {} } = useContext(Context);

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

  const isSelected = props.isDeepSelected || props.isShallowSelected;
  const selectedClass = isSelected ? " select:none" : "";
  const containerDeepSelectedClass = props.isDeepSelected ? "bg-gray-200" : "";

  const editor = useEditor({
    extensions: [Document, Paragraph, Text],
    editorProps: {
      attributes: {
        class: `focus:outline-none text-gray-700 ${selectedClass}`,
      },
    },
    content: props.humanText,
  });

  editor.setOptions({editable: !isSelected});

  return (
    <div
      {...mouseEvents}
      className={`flex-grow ${selectedClass} ${containerDeepSelectedClass}`}
    >
      <EditorContent editor={editor} />
    </div>
  );
};
