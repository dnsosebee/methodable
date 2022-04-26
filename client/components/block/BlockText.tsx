import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import { Editor } from "@tiptap/core";
import { useContext, useEffect, useRef } from "react";
import { logMouseEvent, logKeyEvent, logEditorEvent, logEffect } from "../../lib/loggers";
import {
  IAction,
  IEditHumanTextAction,
  IEnterWithNoSelectionAction,
  IClearFocusLatchAction,
  ISelectionAction,
  ICursorMoveAction,
  IBackspaceAction,
  ITabAction,
} from "../../model/state/actionTypes";
import { BlockId, HierarchyIndex, HumanText, IState } from "../../model/state/stateTypes";
import { Context } from "./ContextBlock";

export interface IBlockTextProps {
  id: BlockId;
  humanText: HumanText;
  hIndex: HierarchyIndex;
  isDeepSelected: boolean;
  isGlobalSelectionActive: boolean;
}

export const BlockText = (props: IBlockTextProps) => {
  let clickOriginatedInThisText = useRef(false); // whether the current click/drag started in this text
  let isFocused = useRef(false); // whether the current text is focused
  let propsRef = useRef(props); // yuck: using this to forego stale closures
  const { state, dispatch }: { state: IState; dispatch: (action: IAction) => {} } =
    useContext(Context);

  const click = () => {
    logMouseEvent("onClick " + props.humanText);
  };

  const mouseEnter = (e: React.MouseEvent) => {
    if (isMouseDown(e)) {
      const action: ISelectionAction = {
        type: "selection change",
        hIndex: props.hIndex,
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
        const action: ISelectionAction = {
          type: "selection start",
          hIndex: props.hIndex,
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
    const action: ISelectionAction = {
      type: "mouse down",
      hIndex: props.hIndex,
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
        ArrowUp: () => handleUpArrowPress(this.editor),
        ArrowDown: () => handleDownArrowPress(this.editor),
        ArrowLeft: () => handleLeftArrowPress(this.editor),
        ArrowRight: () => handleRightArrowPress(this.editor),
        Backspace: () => handleBackspacePress(this.editor),
        Tab: () => handleTabPress(this.editor),
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
        logEditorEvent(
          "onUpdate: [" + propsRef.current.hIndex + ", id: " + propsRef.current.id + "]"
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
        logEditorEvent("onFocus: [" + props.hIndex);
        isFocused.current = true;
      },
      onBlur() {
        logEditorEvent("onBlur + [" + props.hIndex);
        isFocused.current = false;
      },
    },
    [props.isGlobalSelectionActive]
  );

  const handleEnterPress = (editor: Editor) => {
    logKeyEvent(
      "onEnterPress, index: " +
        props.hIndex +
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
      hIndex: propsRef.current.hIndex,
      oldText,
      newText,
    };
    dispatch(action);
    return editor.commands.blur();
  };

  const handleUpArrowPress = (editor: Editor) => {
    logKeyEvent("onUpArrowPress, index: " + props.hIndex);
    const action: ICursorMoveAction = {
      type: "move cursor up",
      hIndex: propsRef.current.hIndex,
      focusPosition: editor.state.selection.anchor,
    };
    dispatch(action);
    return editor.commands.blur();
  };

  const handleDownArrowPress = (editor: Editor) => {
    logKeyEvent("onDownArrowPress, index: " + props.hIndex);
    const action: ICursorMoveAction = {
      type: "move cursor down",
      hIndex: propsRef.current.hIndex,
      focusPosition: editor.state.selection.anchor,
    };
    dispatch(action);
    return editor.commands.blur();
  };

  const handleLeftArrowPress = (editor: Editor) => {
    logKeyEvent("onLeftArrowPress, index: " + props.hIndex);
    const focusPosition = editor.state.selection.anchor;
    if (focusPosition === 1) {
      // we're at the beginning of the line already, so dispatch the action
      const action: ICursorMoveAction = {
        type: "move cursor up",
        hIndex: propsRef.current.hIndex,
        focusPosition: "end",
      };
      dispatch(action);
      return editor.commands.blur();
    }
    return false;
  };

  const handleRightArrowPress = (editor: Editor) => {
    logKeyEvent("onRightArrowPress, index: " + props.hIndex);
    const focusPosition = editor.state.selection.anchor;
    if (focusPosition === editor.getText().length + 1) {
      // we're at the end of the line already, so dispatch the action
      const action: ICursorMoveAction = {
        type: "move cursor down",
        hIndex: propsRef.current.hIndex,
        focusPosition: "start",
      };
      dispatch(action);
      return editor.commands.blur();
    }
    return false;
  };

  const handleBackspacePress = (editor: Editor) => {
    logKeyEvent("onBackspacePress, index: " + props.hIndex);
    const editorText = editor.getText();
    const focusPosition = editor.state.selection.anchor;
    if (focusPosition === 1) {
      // we're at the beginning of the line already, so dispatch the action
      const action: IBackspaceAction = {
        type: "backspace",
        hIndex: propsRef.current.hIndex,
        id: propsRef.current.id,
        humanText: editorText,
      };
      dispatch(action);
      return editor.commands.blur();
    }
    return false;
  };

  const handleTabPress = (editor: Editor) => {
    logKeyEvent("onTabPress, index: " + props.hIndex);
    const focusPosition = editor.state.selection.anchor;
    const action: ITabAction = {
      type: "tab",
      hIndex: propsRef.current.hIndex,
      id: propsRef.current.id,
      focusPosition,
    };
    dispatch(action);
    return true;
  };

  // keep propsRef up to date
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  // We blur whenever a selection starts, so that only our synthetic selection is visible/active
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      if (props.isGlobalSelectionActive) {
        logEffect("blurring for index: " + props.hIndex);
        editor.commands.blur();
      }
    }
  }, [!!editor, props.isGlobalSelectionActive]);

  // we only update the editor content when the editor is blurred, so as to prevent collisions
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      if (!isFocused.current) {
        if (props.humanText !== editor.getText()) {
          logEffect("updating editor content for index: " + props.hIndex);
          editor.commands.setContent(props.humanText);
        }
      }
    }
  }, [!!editor, props.humanText, isFocused.current]);

  // set editor focus based on whether state's focusIndex is this block's index
  useEffect(() => {
    if (editor && !editor.isDestroyed && state) {
      if (state.focusIndex.join(".") === props.hIndex.join(".")) {
        logEffect(
          "setting focus for index: " + props.hIndex + ", focus position: " + state.focusPosition
        );
        editor.commands.setContent(props.humanText);
        editor.commands.focus(state.focusPosition);
        const action: IClearFocusLatchAction = { type: "clear focus latch" };
        dispatch(action);
      }
    }
  }, [!!editor, state.focusIndex, props.hIndex]);

  return (
    <div {...mouseEvents} className={`flex-grow ${selectedClass} ${containerDeepSelectedClass}`}>
      <EditorContent editor={editor} />
    </div>
  );
};
