import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import { Editor } from "@tiptap/core";
import { useContext, useEffect, useRef } from "react";
import { logMouseEvent, logKeyEvent } from "../../lib/loggers";
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
import { Context } from "./ContextBlock";

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

  const selectedClass = props.isGlobalSelectionActive ? " select-none" : "";
  const containerDeepSelectedClass = props.isDeepSelected ? "bg-gray-200" : "";

  const CustomExtension = Document.extend({
    addKeyboardShortcuts() {
      return {
        // ↓ your new keyboard shortcut
        Enter: () => {
          // console.log("enter was pressed");
          handleEnterPress(this.editor);
          return this.editor.commands.command(() => {
            return false;
          });
        },
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
      editable: !props.isGlobalSelectionActive,
      content: props.humanText,
      onUpdate({ editor }) {
        const action: IEditHumanTextAction = {
          type: "text edit",
          id: props.id,
          humanText: editor.getText(),
          focusPosition: editor.state.selection.anchor,
        };
        dispatch(action);
      },
      onFocus() {
        isFocused.current = true;
      },
      onBlur() {
        isFocused.current = false;
      },
    },
    [props.isGlobalSelectionActive]
  );

  const handleEnterPress = (editor: Editor) => {
    logKeyEvent("onEnterPress " + props.index);
    const editorText = editor.getText();
    const mousePosition = editor.state.selection.anchor;
    const oldText = editorText.slice(0, mousePosition - 1);
    const newText = editorText.slice(mousePosition - 1);
    editor.commands.setContent(oldText);
    const action: IEnterWithNoSelectionAction = {
      type: "enter with no selection",
      id: props.id,
      index: props.index,
      oldText,
      newText,
    };
    dispatch(action);
  };

  //TODO delete this!
  function wait(ms) {
    var start = Date.now(),
      now = start;
    while (now - start < ms) {
      now = Date.now();
    }
  }

  // set editor focus based on whether state's focusIndex is this block's index
  useEffect(() => {
    if (editor && !editor.isDestroyed && state) {
      if (state.focusIndex.join(".") === props.index.join(".")) {
        editor.commands.focus(state.focusPosition);
        console.log("just focused ", props.index, " at ", state.focusPosition);
        wait(1000);
        const action: IClearFocusLatchAction = { type: "clear focus latch" };
        dispatch(action);
      }
    }
  }, [!!editor, state.focusIndex, props.index]);

  // We blur whenever a selection starts, so that only our synthetic selection is visible/active
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      if (props.isGlobalSelectionActive) {
        editor.commands.blur();
      }
    }
  }, [!!editor, props.isGlobalSelectionActive]);

  // we only update the editor content when the editor is blurred, so as to prevent collisions
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      if (!isFocused.current) {
        editor.commands.setContent(`<p>${props.humanText}</p>`);
      }
    }
  }, [!!editor, props.humanText, isFocused.current]);

  const tempClick = () => {
    if (editor) {
      console.log(editor.state.selection.anchor);
      editor.commands.focus(0);
      console.log("focused ", props.index);
      console.log(editor.state.selection.anchor);
    }
    // wait(3000);
    console.log(editor.state.selection.anchor);
    console.log("done waiting");
  };

  return (
    <div
      {...mouseEvents}
      className={`flex-grow ${selectedClass} ${containerDeepSelectedClass}`}
    >
      <EditorContent editor={editor} />
      <button onClick={tempClick}>focus (0)</button>
    </div>
  );
};
