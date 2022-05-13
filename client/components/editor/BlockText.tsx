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
  LocatedBlockId,
  Path,
} from "../../model/newState";
import { ActionType2 } from "../../model/newActions";
import { NoSuchBlockError } from "../../lib/errors";

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
  const { state, dispatch }: { state: IState2; dispatch: (action: ActionType2) => {} } =
    useContext(Context);
  let blockRef = useRef(fullBlockFromLocatedBlockId(state, props.path[props.path.length - 1]));
  let isFocused = useRef(false); // whether the current text is focused
  let propsRef = useRef(props); // yuck: using this to forego stale closures
  const isRootRef = useRef(props.path.length === 1);

  const click = () => {
    logMouseEvent("onClick " + props.humanText);
  };

  const mouseEnter = (e: React.MouseEvent) => {
    if (isMouseDown(e)) {
      logMouseEvent("onMouseEnter mouseIsDown " + props.humanText);
      dispatch((state: IState2) => {
        if (isRootRef.current) {
          return state;
        }
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
          if (isRootRef.current) {
            return state;
          }
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
          return state.updateBlockText(blockRef.current.blockContent.id, editor.getText());
        });
      },
      onFocus() {
        logEditorEvent("onFocus: [" + propsRef.current.path);
        isFocused.current = true;
      },
      onBlur() {
        logEditorEvent("onBlur + [" + propsRef.current.path);
        isFocused.current = false;
      },
    },
    [props.isGlobalSelectionActive]
  );

  const handleEnterPress = (editor: Editor) => {
    logKeyEvent(
      "onEnterPress, path: " + propsRef.current.path + ", humanText: " + propsRef.current.humanText
    );
    const editorText = editor.getText();
    const focusPosition = getFocusPosition(editor);
    const leftText = editorText.slice(0, focusPosition - 1);
    const rightText = editorText.slice(focusPosition - 1);
    dispatch((state: IState2) => {
      const newLocatedBlockId = crypto.randomUUID();
      if (leftText.length === 0) {
        // if enter is pressed at the beginning of the line, we just bump that block down a line, and focus on the new line above
        // oldBlock text stays the same
        if (isRootRef.current) {
          return state;
        }
        const newPath = propsRef.current.path.splice(-1, 1, newLocatedBlockId);
        return state
          .insertNewBlock(
            blockRef.current.locatedBlock.leftId,
            blockRef.current.locatedBlock.parentId,
            "",
            blockRef.current.blockContent.blockType,
            newLocatedBlockId
          )
          .setFocusLatch(propsRef.current.path.splice(-1, 1, newLocatedBlockId), "start");
      } else if (blockRef.current.blockContent.childLocatedBlocks.length === 0) {
        // if the old block has no children, we add a sibling after the old block
        return state
          .insertNewBlock(
            blockRef.current.locatedBlock.id,
            blockRef.current.locatedBlock.parentId,
            rightText,
            blockRef.current.blockContent.blockType,
            newLocatedBlockId
          )
          .updateBlockText(blockRef.current.blockContent.id, leftText)
          .setFocusLatch(propsRef.current.path.splice(-1, 1, newLocatedBlockId), "start");
      } else {
        // if the old block does have children, we add a child to the old block
        return state
          .insertNewBlock(
            null,
            blockRef.current.locatedBlock.contentId,
            rightText,
            blockRef.current.blockContent.blockType,
            newLocatedBlockId
          )
          .updateBlockText(blockRef.current.blockContent.id, leftText)
          .setFocusLatch(propsRef.current.path.splice(-1, 0, newLocatedBlockId), "start");
      }
    });
    return PREVENT_TIPTAP_DEFAULT;
  };

  const handleUpArrowPress = (editor: Editor) => {
    logKeyEvent("onUpArrowPress, path: " + propsRef.current.path);
    dispatch((state: IState2) => {
      try {
        const upstairsNeighborPath = state.getUpstairsNeighborPath(propsRef.current.path);
        return state.setFocusLatch(upstairsNeighborPath, getFocusPosition(editor));
      } catch (e) {
        if (e instanceof NoSuchBlockError) {
          return state;
        }
        throw e;
      }
    });
    return PREVENT_TIPTAP_DEFAULT;
  };

  const handleDownArrowPress = (editor: Editor) => {
    logKeyEvent("onDownArrowPress, path: " + propsRef.current.path);
    dispatch((state: IState2) => {
      try {
        const downstairsNeighborPath = state.getDownstairsNeighborPath(propsRef.current.path);
        return state.setFocusLatch(downstairsNeighborPath, getFocusPosition(editor));
      } catch (e) {
        if (e instanceof NoSuchBlockError) {
          return state;
        }
        throw e;
      }
    });
    return PREVENT_TIPTAP_DEFAULT;
  };

  const handleLeftArrowPress = (editor: Editor) => {
    logKeyEvent("onLeftArrowPress, path: " + propsRef.current.path);
    const focusPosition = getFocusPosition(editor);
    if (focusPosition === 1) {
      // we're at the beginning of the line already, so dispatch the action
      dispatch((state: IState2) => {
        try {
          const upstairsNeighborPath = state.getUpstairsNeighborPath(propsRef.current.path);
          return state.setFocusLatch(upstairsNeighborPath, "end");
        } catch (e) {
          if (e instanceof NoSuchBlockError) {
            return state;
          }
          throw e;
        }
      });
      return PREVENT_TIPTAP_DEFAULT;
    }
    return ALLOW_TIPTAP_DEFAULT;
  };

  const handleRightArrowPress = (editor: Editor) => {
    logKeyEvent("onRightArrowPress, path: " + propsRef.current.path);
    const focusPosition = getFocusPosition(editor);
    if (focusPosition === editor.getText().length + 1) {
      // we're at the end of the line already, so dispatch the action
      dispatch((state: IState2) => {
        try {
          const downstairsNeighborPath = state.getDownstairsNeighborPath(propsRef.current.path);
          return state.setFocusLatch(downstairsNeighborPath, "start");
        } catch (e) {
          if (e instanceof NoSuchBlockError) {
            return state;
          }
          throw e;
        }
      });
      return PREVENT_TIPTAP_DEFAULT;
    }
    return ALLOW_TIPTAP_DEFAULT;
  };

  const handleBackspacePress = (editor: Editor) => {
    logKeyEvent("onBackspacePress, path: " + propsRef.current.path);
    const editorText = editor.getText();
    const focusPosition = getFocusPosition(editor);
    if (focusPosition === 1 && !isRootRef.current) {
      // we're at the beginning of the line already, so dispatch the action
      dispatch((state: IState2) => {
        const upstairsNeighborPath = state.getUpstairsNeighborPath(propsRef.current.path);
        const upstairsNeighborLocatedBlockId =
          upstairsNeighborPath[upstairsNeighborPath.length - 1];
        const upstairsNeighborBlock = fullBlockFromLocatedBlockId(
          state,
          upstairsNeighborLocatedBlockId
        );
        if (
          upstairsNeighborBlock.blockContent.childLocatedBlocks.length <= 1 &&
          upstairsNeighborBlock.blockContent.locatedBlocks.length <= 1 &&
          upstairsNeighborBlock.blockContent.humanText.length === 0
        ) {
          // if the upstairs neighbor is a simple blank line with a single parent and no children,
          // we shift the current line up to replace the upstairs neighbor
          // we do this even when the current block has multiple parents
          return state
            .removeLocatedBlock(upstairsNeighborLocatedBlockId)
            .moveLocatedBlock(
              blockRef.current.locatedBlock.id,
              upstairsNeighborBlock.locatedBlock.leftId,
              upstairsNeighborBlock.locatedBlock.parentId
            )
            .setFocusLatch(
              upstairsNeighborPath.splice(-1, 1, blockRef.current.locatedBlock.id),
              "start"
            );
        } else if (blockRef.current.blockContent.locatedBlocks.length > 1) {
          // if the current block has multiple parents and the upstairs neighbor is non-simple,
          // we don't do anything
          return state;
        } else if (
          blockRef.current.blockContent.childLocatedBlocks.length > 0 &&
          upstairsNeighborBlock.blockContent.childLocatedBlocks.length > 1
        ) {
          // if both merging blocks have children, that's weird and we don't do anything
          return state;
        } else {
          // in all other cases,
          // we merge current block into upstairs neighbor, maintaining upstairs neighbor's id
          return state
            .removeLocatedBlock(blockRef.current.locatedBlock.id)
            .updateBlockText(
              upstairsNeighborBlock.blockContent.id,
              upstairsNeighborBlock.blockContent.humanText + editorText
            )
            .setFocusLatch(
              upstairsNeighborPath,
              upstairsNeighborBlock.blockContent.humanText.length + 1
            );
        }
      });
      return PREVENT_TIPTAP_DEFAULT;
    }
    return ALLOW_TIPTAP_DEFAULT;
  };

  const handleTabPress = (editor: Editor) => {
    logKeyEvent("onTabPress, path: " + propsRef.current.path);
    const focusPosition = getFocusPosition(editor);
    dispatch((state: IState2) => {
      if (isRootRef.current) {
        // if we're at the root, we don't do anything
        return state;
      }
      let focusPath: Path = [...propsRef.current.path];
      let parentContent = state.blockContents.get(blockRef.current.locatedBlock.parentId);
      if (parentContent.getLeftmostChildId() === blockRef.current.locatedBlock.id) {
        // if we're the first child, just add an older sibling and proceed, don't return yet
        const newLocatedBlockId = crypto.randomUUID();
        state = state.insertNewBlock(
          null,
          parentContent.id,
          "",
          blockRef.current.blockContent.blockType,
          newLocatedBlockId
        );
        parentContent = state.blockContents.get(parentContent.id);
        focusPath = focusPath.splice(-1, 1, newLocatedBlockId);
      }
      const leftSiblingLocatedId = parentContent.getLeftSiblingIdOf(
        blockRef.current.locatedBlock.id
      );
      const leftSiblingBlock = fullBlockFromLocatedBlockId(state, leftSiblingLocatedId);
      return state
        .moveLocatedBlock(
          blockRef.current.locatedBlock.id,
          leftSiblingBlock.blockContent.getRightmostChildId(),
          leftSiblingBlock.blockContent.id
        )
        .setFocusLatch(focusPath, focusPosition);
    });
    return PREVENT_TIPTAP_DEFAULT;
  };

  const handleShiftTabPress = (editor: Editor) => {
    logKeyEvent("onShiftTabPress, path: " + propsRef.current.path);
    const focusPosition = getFocusPosition(editor);
    dispatch((state: IState2) => {
      if (propsRef.current.path.length < 3) {
        // If there's no granparent, we don't do anything
        return state;
      }
      const parentLocatedBlockId = propsRef.current.path[propsRef.current.path.length - 2];
      const parentBlock = fullBlockFromLocatedBlockId(state, parentLocatedBlockId);
      const rightSiblingLocatedId = parentBlock.blockContent.getRightSiblingIdOf(
        blockRef.current.locatedBlock.id
      );
      const updatedState = state
        .moveLocatedBlock(
          blockRef.current.locatedBlock.id,
          parentLocatedBlockId,
          parentBlock.locatedBlock.parentId
        )
        .setFocusLatch(
          propsRef.current.path.splice(-2, 1, blockRef.current.locatedBlock.id),
          focusPosition
        );
      if (rightSiblingLocatedId) {
        return updatedState.moveChildren(rightSiblingLocatedId, blockRef.current.blockContent.id);
      }
      return updatedState;
    });
    return PREVENT_TIPTAP_DEFAULT;
  };

  // keep propsRef up to date
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  // keep blockRef and isRootRef up to date
  useEffect(() => {
    blockRef.current = fullBlockFromLocatedBlockId(state, props.path[props.path.length - 1]);
    isRootRef.current = props.path.length === 1;
  }, [props.path]);

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

  // set editor focus based on whether state's focusPath is this block's path
  useEffect(() => {
    if (editor && !editor.isDestroyed && state) {
      if (pathEquals(state.focusPath, props.path)) {
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
  }, [!!editor, state.focusPath, props.path]);

  return (
    <div {...mouseEvents} className={`flex-grow ${selectedClass} ${containerDeepSelectedClass}`}>
      <EditorContent editor={editor} />
    </div>
  );
};
