import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import { Editor } from "@tiptap/core";
import { useContext, useEffect, useRef } from "react";
import { logMouseEvent, logKeyEvent, logEditorEvent, logEffect } from "../../lib/loggers";
import { Context } from "../ContextWrapper";
import { getFocusPosition, pathEquals } from "../../lib/helpers";
import {
  fullBlockFromLocatedBlockId,
  HumanText,
  IState2,
  Path,
} from "../../model/newState";
import { ActionType2 } from "../../model/newActions";
import path from "path";

const PREVENT_TIPTAP_DEFAULT = true;
const ALLOW_TIPTAP_DEFAULT = false;

export interface IBlockTextProps {
  path: Path;
  humanText: HumanText;
  isDeepSelected: boolean;
  isGlobalSelectionActive: boolean;
}

export const BlockText = (props: IBlockTextProps) => {
  let clickOriginatedInThisText = useRef(false); // whether the current click/drag started in this text
  let isFocused = useRef(false); // whether the current text is focused
  let propsRef = useRef(props); // yuck: using this to forego stale closures
  const { state, dispatch }: { state: IState2; dispatch: (action: ActionType2) => {} } =
    useContext(Context);
  const { blockContent: content, locatedBlock: located } = fullBlockFromLocatedBlockId(
    state,
    props.path[props.path.length - 1]
  );

  const click = () => {
    logMouseEvent("onClick " + props.humanText);
  };

  const mouseEnter = (e: React.MouseEvent) => {
    if (isMouseDown(e)) {
      logMouseEvent("onMouseEnter mouseIsDown " + props.humanText);
      dispatch((state: IState2) => {
        return state.changeSelection(props.path);
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
        dispatch((state: IState2) => {
          return state.startSelection(props.path);
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
    dispatch((state: IState2) => {
      return state.endSelection();
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

  const selectedClass = propsRef.current.isGlobalSelectionActive ? "select-none" : "";
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
        logEditorEvent("onUpdate:" + propsRef.current.path);
        dispatch((state: IState2) => {
          return state.updateBlockContent({ ...content, humanText: editor.getText() });
        });
      },
      onFocus() {
        logEditorEvent("onFocus: [" + props.path);
        isFocused.current = true;
      },
      onBlur() {
        logEditorEvent("onBlur + [" + props.path);
        isFocused.current = false;
      },
    },
    [props.isGlobalSelectionActive]
  );

  const handleEnterPress = (editor: Editor) => {
    logKeyEvent("onEnterPress, path: " + props.path + ", humanText: " + props.humanText);
    const editorText = editor.getText();
    const focusPosition = getFocusPosition(editor);
    const leftText = editorText.slice(0, focusPosition - 1);
    const rightText = editorText.slice(focusPosition - 1);
    dispatch((state: IState2) => {
      const newLocatedBlockId = crypto.randomUUID();
      if (leftText.length === 0) {
        // if enter is pressed at the beginning of the line, we just bump that block down a line, and focus on the new line above
        //oldBlock text stays the same
        return state
          .insertNewBlock(
            located.leftId,
            located.parentId,
            "",
            content.blockType,
            newLocatedBlockId
          )
          .setFocusLatch(newLocatedBlockId, "start");
      } else if (content.childLocatedBlocks.length === 0) {
        // if the old block has no children, we add a sibling after the old block
        return state
          .insertNewBlock(
            located.id,
            located.parentId,
            rightText,
            content.blockType,
            newLocatedBlockId
          )
          .updateBlockContent({ ...content, humanText: leftText })
          .setFocusLatch(newLocatedBlockId, "start");
      } else {
        // if the old block does have children, we add a child to the old block
        return state
          .insertNewBlock(null, located.contentId, rightText, content.blockType, newLocatedBlockId)
          .updateBlockContent({ ...content, humanText: leftText })
          .setFocusLatch(newLocatedBlockId, "start");
      }
    });
    return PREVENT_TIPTAP_DEFAULT;
  };

  const handleUpArrowPress = (editor: Editor) => {
    logKeyEvent("onUpArrowPress, path: " + props.path);
    dispatch((state: IState2) => {
      try {
        const upstairsNeighborLocatedBlockId = state.getUpstairsNeighbor(props.path);
        return state.setFocusLatch(upstairsNeighborLocatedBlockId, getFocusPosition(editor));
      } catch (e) {
        return state;
      }
    });
    return PREVENT_TIPTAP_DEFAULT;
  };

  const handleDownArrowPress = (editor: Editor) => {
    logKeyEvent("onDownArrowPress, path: " + props.path);
    dispatch((state: IState2) => {
      try {
        const downstairsNeighborLocatedBlockId = state.getDownstairsNeighbor(props.path);
        return state.setFocusLatch(downstairsNeighborLocatedBlockId, getFocusPosition(editor));
      } catch (e) {
        return state;
      }
    });
    return PREVENT_TIPTAP_DEFAULT;
  };

  const handleLeftArrowPress = (editor: Editor) => {
    logKeyEvent("onLeftArrowPress, path: " + props.path);
    const focusPosition = getFocusPosition(editor);
    if (focusPosition === 1) {
      // we're at the beginning of the line already, so dispatch the action
      dispatch((state: IState2) => {
        try {
          const upstairsNeighborLocatedBlockId = state.getUpstairsNeighbor(props.path);
          return state.setFocusLatch(upstairsNeighborLocatedBlockId, "end");
        } catch (e) {
          return state;
        }
      });
      return PREVENT_TIPTAP_DEFAULT;
    }
    return ALLOW_TIPTAP_DEFAULT;
  };

  const handleRightArrowPress = (editor: Editor) => {
    logKeyEvent("onRightArrowPress, path: " + props.path);
    const focusPosition = getFocusPosition(editor);
    if (focusPosition === editor.getText().length + 1) {
      // we're at the end of the line already, so dispatch the action
      dispatch((state: IState2) => {
        try {
          const downstairsNeighborLocatedBlockId = state.getDownstairsNeighbor(props.path);
          return state.setFocusLatch(downstairsNeighborLocatedBlockId, "start");
        } catch (e) {
          return state;
        }
      });
      return PREVENT_TIPTAP_DEFAULT;
    }
    return ALLOW_TIPTAP_DEFAULT;
  };

  const handleBackspacePress = (editor: Editor) => {
    logKeyEvent("onBackspacePress, path: " + props.path);
    const editorText = editor.getText();
    const focusPosition = getFocusPosition(editor);
    if (focusPosition === 1) {
      // we're at the beginning of the line already, so dispatch the action
      dispatch((state: IState2) => {
        return state;
      });
      return PREVENT_TIPTAP_DEFAULT;
    }
    return ALLOW_TIPTAP_DEFAULT;
  };

  const handleTabPress = (editor: Editor) => {
    logKeyEvent("onTabPress, path: " + props.path);
    const focusPosition = getFocusPosition(editor);
    dispatch((state: IState2) => {
      return state;
    });
    return PREVENT_TIPTAP_DEFAULT;
  };

  const handleShiftTabPress = (editor: Editor) => {
    logKeyEvent("onShiftTabPress, path: " + props.path);
    const focusPosition = getFocusPosition(editor);
    dispatch((state: IState2) => {
      return state
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
        logEffect("blurring for path: " + props.path);
        editor.commands.blur();
      }
    }
  }, [!!editor, props.isGlobalSelectionActive]);

  // we only update the editor content when the editor is blurred, so as to prevent collisions
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      if (!isFocused.current) {
        if (props.humanText !== editor.getText()) {
          logEffect("updating editor content for path: " + props.path);
          editor.commands.setContent(props.humanText);
        }
      }
    }
  }, [!!editor, props.humanText, isFocused.current]);

  // set editor focus based on whether state's focusLocatedBlockId is this block's id
  useEffect(() => {
    if (editor && !editor.isDestroyed && state) {
      if (state.focusLocatedBlockId === props.path[props.path.length - 1]) {
        logEffect(
          "setting focus for path: " + props.path + ", focus position: " + state.focusPosition
        );
        editor.commands.setContent(props.humanText);
        editor.commands.focus(state.focusPosition);
        dispatch((state: IState2) => {
          return state.clearFocusLatch();
        });
      }
    }
  }, [!!editor, state.focusLocatedBlockId, props.path]);

  return (
    <div {...mouseEvents} className={`flex-grow ${selectedClass} ${containerDeepSelectedClass}`}>
      <EditorContent editor={editor} />
    </div>
  );
};
