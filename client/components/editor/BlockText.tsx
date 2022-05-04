import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import { Editor } from "@tiptap/core";
import { useContext, useEffect, useRef } from "react";
import { logMouseEvent, logKeyEvent, logEditorEvent, logEffect } from "../../lib/loggers";
import { BlockId, HierarchyIndex, HumanText, IState } from "../../model/state/stateTypes";
import { Context } from "../ContextWrapper";
import {
  ActionType,
  backspace,
  changeSelection,
  clearFocusLatch,
  editHumanText,
  enterWithNoSelection,
  mouseDownAction,
  moveCursorDownALine,
  moveCursorUpALine,
  shiftTab,
  startSelection,
  tab,
} from "../../model/state/actions";
import { getFocusPosition, hIndexEquals } from "../../lib/helpers";

const PREVENT_TIPTAP_DEFAULT = true;
const ALLOW_TIPTAP_DEFAULT = false;

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
  const { state, dispatch }: { state: IState; dispatch: (action: ActionType) => {} } =
    useContext(Context);

  const click = () => {
    logMouseEvent("onClick " + props.humanText);
  };

  const mouseEnter = (e: React.MouseEvent) => {
    if (isMouseDown(e)) {
      logMouseEvent("onMouseEnter mouseIsDown " + props.humanText);
      dispatch((state: IState) => {
        return changeSelection(state, props.hIndex);
      });
    } else {
      logMouseEvent("onMouseEnter mouseisUp " + props.humanText);
    }
  };

  const isMouseDown = (e: React.MouseEvent): boolean => {
    return (e.buttons & 1) === 1;
  };

  const mouseLeave = (e: React.MouseEvent) => {
    if (isMouseDown(e)) {
      logMouseEvent("onMouseLeave mouseIsDown " + props.humanText);
      if (clickOriginatedInThisText.current) {
        dispatch((state: IState) => {
          return startSelection(state, props.hIndex);
        });
      }
    } else {
      logMouseEvent("onMouseLeave mouseisUp " + props.humanText);
    }
    clickOriginatedInThisText.current = false;
  };

  const mouseDown = () => {
    logMouseEvent("onMouseDown " + props.humanText);
    clickOriginatedInThisText.current = true;
    dispatch((state: IState) => {
      return mouseDownAction(state, props.hIndex);
    });
  };

  const mouseUp = () => {
    logMouseEvent("onMouseUp " + props.humanText);
    clickOriginatedInThisText.current = false;
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
        "Shift-Tab": () => handleShiftTabPress(this.editor),
        // we're not gonna deal with 2d text boxes yet, but we will have to soon enough
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
        dispatch((state: IState) => {
          return editHumanText(
            state,
            propsRef.current.id,
            editor.getText(),
            getFocusPosition(editor)
          );
        });
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
    const focusPosition = getFocusPosition(editor);
    const oldText = editorText.slice(0, focusPosition - 1);
    const newText = editorText.slice(focusPosition - 1);
    dispatch((state: IState) => {
      return enterWithNoSelection(
        state,
        propsRef.current.hIndex,
        propsRef.current.id,
        oldText,
        newText
      );
    });
    return PREVENT_TIPTAP_DEFAULT;
  };

  const handleUpArrowPress = (editor: Editor) => {
    logKeyEvent("onUpArrowPress, index: " + props.hIndex);
    dispatch((state: IState) => {
      return moveCursorUpALine(state, propsRef.current.hIndex, getFocusPosition(editor));
    });
    return PREVENT_TIPTAP_DEFAULT;
  };

  const handleDownArrowPress = (editor: Editor) => {
    logKeyEvent("onDownArrowPress, index: " + props.hIndex);
    dispatch((state: IState) => {
      return moveCursorDownALine(state, propsRef.current.hIndex, getFocusPosition(editor));
    });
    return PREVENT_TIPTAP_DEFAULT;
  };

  const handleLeftArrowPress = (editor: Editor) => {
    logKeyEvent("onLeftArrowPress, index: " + props.hIndex);
    const focusPosition = getFocusPosition(editor);
    if (focusPosition === 1) {
      // we're at the beginning of the line already, so dispatch the action
      dispatch((state: IState) => {
        return moveCursorUpALine(state, propsRef.current.hIndex, "end");
      });
      return PREVENT_TIPTAP_DEFAULT;
    }
    return ALLOW_TIPTAP_DEFAULT;
  };

  const handleRightArrowPress = (editor: Editor) => {
    logKeyEvent("onRightArrowPress, index: " + props.hIndex);
    const focusPosition = getFocusPosition(editor);
    if (focusPosition === editor.getText().length + 1) {
      // we're at the end of the line already, so dispatch the action
      dispatch((state: IState) => {
        return moveCursorDownALine(state, propsRef.current.hIndex, "start");
      });
      return PREVENT_TIPTAP_DEFAULT;
    }
    return ALLOW_TIPTAP_DEFAULT;
  };

  const handleBackspacePress = (editor: Editor) => {
    logKeyEvent("onBackspacePress, index: " + props.hIndex);
    const editorText = editor.getText();
    const focusPosition = getFocusPosition(editor);
    if (focusPosition === 1) {
      // we're at the beginning of the line already, so dispatch the action
      dispatch((state: IState) => {
        return backspace(state, propsRef.current.hIndex, propsRef.current.id);
      });
      return PREVENT_TIPTAP_DEFAULT;
    }
    return ALLOW_TIPTAP_DEFAULT;
  };

  const handleTabPress = (editor: Editor) => {
    logKeyEvent("onTabPress, index: " + props.hIndex);
    const focusPosition = getFocusPosition(editor);
    dispatch((state: IState) => {
      return tab(state, propsRef.current.hIndex, propsRef.current.id, focusPosition);
    });
    return PREVENT_TIPTAP_DEFAULT;
  };

  const handleShiftTabPress = (editor: Editor) => {
    logKeyEvent("onShiftTabPress, index: " + props.hIndex);
    const focusPosition = getFocusPosition(editor);
    dispatch((state: IState) => {
      return shiftTab(state, propsRef.current.hIndex, propsRef.current.id, focusPosition);
    });
    return PREVENT_TIPTAP_DEFAULT;
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
      if (hIndexEquals(state.focusIndex, props.hIndex)) {
        logEffect(
          "setting focus for index: " + props.hIndex + ", focus position: " + state.focusPosition
        );
        editor.commands.setContent(props.humanText);
        editor.commands.focus(state.focusPosition);
        dispatch((state: IState) => {
          return clearFocusLatch(state);
        });
      }
    }
  }, [!!editor, state.focusIndex, props.hIndex]);

  return (
    <div {...mouseEvents} className={`flex-grow ${selectedClass} ${containerDeepSelectedClass}`}>
      <EditorContent editor={editor} />
    </div>
  );
};
