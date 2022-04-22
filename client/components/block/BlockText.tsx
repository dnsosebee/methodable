import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import { Editor } from "@tiptap/core";
import { useContext, useEffect, useRef } from "react";
import {
  logMouseEvent,
  logKeyEvent,
  logEditorEvent,
  logEffect,
} from "../../lib/loggers";
import {
  IAction,
  IChangeSelectionAction,
  IEditHumanTextAction,
  IMouseDownAction,
  IStartSelectionAction,
  IEnterWithNoSelectionAction,
  IClearFocusLatchAction,
} from "../../model/state/actionTypes";
import {
  BlockId,
  HierarchyIndex,
  HumanText,
  IState,
} from "../../model/state/stateTypes";
import { Context, ContextBlock } from "./ContextBlock";
import { waitForDebugger } from "inspector";
import { wait } from "../../lib/helpers";

export interface IBlockTextProps {
  id: BlockId;
  humanText: HumanText;
  index: HierarchyIndex;
  isDeepSelected: boolean;
  isGlobalSelectionActive: boolean;
}

export const BlockText = (props: IBlockTextProps) => {
  let clickOriginatedInThisText = useRef(false); // whether the current click/drag started in this text
  let isFocused = useRef(false); // whether the current text is focused
  let propsRef = useRef(props); // yuck: using this to forego stale closures
  const {
    state,
    dispatch,
  }: { state: IState; dispatch: (action: IAction) => {} } = useContext(Context);

  const click = () => {
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

  const selectedClass = props.isGlobalSelectionActive ? " select-none" : "";
  const containerDeepSelectedClass = props.isDeepSelected ? "bg-gray-200" : "";

  const CustomExtension = Document.extend({
    addKeyboardShortcuts() {
      return {
        Enter: () => handleEnterPress(this.editor),
      };
    },
  });

  const editor = useEditor(
    {
      extensions: [CustomExtension, Paragraph, Text],
      editorProps: {
        attributes: {
          class: `focus:outline-none text-gray-700 ${selectedClass}`,
        },
      },
      editable: !propsRef.current.isGlobalSelectionActive,
      content: props.humanText,
      onUpdate({ editor }) {
        logEditorEvent(
          "onUpdate: [" +
            propsRef.current.index +
            ", id: " +
            propsRef.current.id +
            "]"
        );
        const action: IEditHumanTextAction = {
          type: "text edit",
          id: propsRef.current.id,
          humanText: editor.getText(),
          focusPosition: editor.state.selection.anchor,
        };
        dispatch(action);
      },
      onFocus() {
        logEditorEvent("onFocus: [" + props.index);
        isFocused.current = true;
      },
      onBlur() {
        logEditorEvent("onBlur + [" + props.index);
        isFocused.current = false;
      },
    },
    [props.isGlobalSelectionActive]
  );

  const handleEnterPress = (editor: Editor) => {
    logKeyEvent(
      "onEnterPress, index: " +
        props.index +
        ", humanText: " +
        props.humanText +
        ", id: " +
        props.id
    );
    const editorText = editor.getText();
    const mousePosition = editor.state.selection.anchor;
    const oldText = editorText.slice(0, mousePosition - 1);
    const newText = editorText.slice(mousePosition - 1);
    const action: IEnterWithNoSelectionAction = {
      type: "enter with no selection",
      id: propsRef.current.id,
      index: propsRef.current.index,
      oldText,
      newText,
    };
    dispatch(action);
    return editor.commands.blur();
  };

  // keep propsRef up to date
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  // We blur whenever a selection starts, so that only our synthetic selection is visible/active
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      if (props.isGlobalSelectionActive) {
        logEffect("blurring for index: " + props.index);
        editor.commands.blur();
      }
    }
  }, [!!editor, props.isGlobalSelectionActive]);

  // we only update the editor content when the editor is blurred, so as to prevent collisions
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      if (!isFocused.current) {
        if (props.humanText !== editor.getText()) {
          logEffect("updating editor content for index: " + props.index);
          editor.commands.setContent(props.humanText);
        }
      }
    }
  }, [!!editor, props.humanText, isFocused.current]);

  // set editor focus based on whether state's focusIndex is this block's index
  useEffect(() => {
    if (editor && !editor.isDestroyed && state) {
      if (state.focusIndex.join(".") === props.index.join(".")) {
        logEffect(
          "setting focus for index: " +
            props.index +
            ", focus position: " +
            state.focusPosition
        );
        editor.commands.focus(state.focusPosition);
        const action: IClearFocusLatchAction = { type: "clear focus latch" };
        dispatch(action);
      }
    }
  }, [!!editor, state.focusIndex, props.index]);

  return (
    <div
      {...mouseEvents}
      className={`flex-grow ${selectedClass} ${containerDeepSelectedClass}`}
    >
      <EditorContent editor={editor} />
    </div>
  );
};
