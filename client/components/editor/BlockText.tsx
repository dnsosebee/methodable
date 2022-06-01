import { Editor } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import { MutableRefObject, useEffect, useRef } from "react";
import { NoSuchBlockError } from "../../lib/errors";
import { getFocusPosition, pathEquals } from "../../lib/helpers";
import { logEditorEvent, logEffect, logKeyEvent, logMouseEvent } from "../../lib/loggers";
import { BlockContentId, HumanText, IBlockContent } from "../../model/blockContent";
import { fullBlockFromLocatedBlockId } from "../../model/fullBlock";
import { ILocatedBlock } from "../../model/locatedBlock";
import { IGraph, Path } from "../../model/graph";
import { GraphAction } from "../GraphProvider";
import { enterPressActionGenerator } from "../../model/actions";
import { pasteActionGenerator } from "../../lib/paste";
import { useGraphWithPaths } from "../../model/graphWithPaths";
import { IFullPath } from "../../model/fullPath";
import { viewGetters } from "../../model/verbs/view";

const PREVENT_TIPTAP_DEFAULT = true;
const ALLOW_TIPTAP_DEFAULT = false;

export interface IBlockTextProps {
  contentId: BlockContentId;
  path: Path;
  humanText: HumanText;
  isDeepSelected: boolean;
  isGlobalSelectionActive: boolean;
}

export const BlockText = (props: IBlockTextProps) => {
  const clickOriginatedInThisText = useRef(false); // whether the current click/drag started in this text
  const {
    graphState,
    graphDispatch,
    fullPathState,
    fullPathDispatch,
    getContentFromPath,
    getDownstairsNeighborPath,
    getUpstairsNeighborPath,
  } = useGraphWithPaths();
  const contentRef: MutableRefObject<IBlockContent> = useRef(
    graphState.blockContents.get(props.contentId)
  );
  const locatedRef: MutableRefObject<null | ILocatedBlock> = useRef(null);
  const isRootRef: MutableRefObject<boolean> = useRef(true);
  if (props.path.length > 0) {
    isRootRef.current = false;
    locatedRef.current = graphState.locatedBlocks.get(props.path[props.path.length - 1]);
  }
  let isFocused = useRef(false); // whether the current text is focused
  let propsRef = useRef(props); // yuck: using this to forego stale closures

  const click = () => {
    logMouseEvent("onClick " + props.humanText);
  };

  const mouseEnter = (e: React.MouseEvent) => {
    if (isMouseDown(e)) {
      logMouseEvent("onMouseEnter mouseIsDown " + props.humanText);
      graphDispatch((graphState: IGraph) => {
        if (isRootRef.current) {
          return graphState;
        }
        return graphState.changeSelection(props.path);
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
        graphDispatch((graphState: IGraph) => {
          if (isRootRef.current) {
            return graphState;
          }
          return graphState.startSelection(props.path);
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
    graphDispatch((graphState: IGraph) => {
      return graphState.endSelection();
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

  const selectedClass = propsRef.current.isGlobalSelectionActive
    ? "selection:bg-transparent"
    : "selection:bg-gray-200";
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
        handlePaste: (view) => {
          view.focus()
          handlePaste();
          return PREVENT_TIPTAP_DEFAULT;
        },
      },
      editable: !props.isGlobalSelectionActive,
      content: props.humanText,
      onUpdate({ editor }) {
        logEditorEvent("onUpdate:" + propsRef.current.path);
        graphDispatch((graphState: IGraph) => {
          return graphState.updateBlockText(contentRef.current.id, editor.getText());
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
    [props.isGlobalSelectionActive, graphState.selectionRange]
  );

  const handleEnterPress = (editor: Editor) => {
    logKeyEvent(
      "onEnterPress, path: " + propsRef.current.path + ", humanText: " + propsRef.current.humanText
    );
    const editorText = editor.getText();
    const focusPosition = getFocusPosition(editor);
    const leftText = editorText.slice(0, focusPosition - 1);
    const rightText = editorText.slice(focusPosition - 1);
    graphDispatch(
      enterPressActionGenerator(
        locatedRef.current,
        contentRef.current,
        isRootRef.current,
        leftText,
        rightText,
        propsRef.current.path,
        fullPathDispatch
      )
    );
    return PREVENT_TIPTAP_DEFAULT;
  };

  const handleUpArrowPress = (editor: Editor) => {
    logKeyEvent("onUpArrowPress, path: " + propsRef.current.path);
    if (isRootRef.current) {
      return ALLOW_TIPTAP_DEFAULT;
    }
    fullPathDispatch((fullPathState: IFullPath): IFullPath => {
      const upstairsNeighborPath = getUpstairsNeighborPath(propsRef.current.path);
      return fullPathState.setFocus(upstairsNeighborPath, getFocusPosition(editor));
    });
    return PREVENT_TIPTAP_DEFAULT;
  };

  const handleDownArrowPress = (editor: Editor) => {
    logKeyEvent("onDownArrowPress, path: " + propsRef.current.path);
    fullPathDispatch((fullPathState: IFullPath): IFullPath => {
      try {
        const downstairsNeighborPath = getDownstairsNeighborPath(propsRef.current.path);
        return fullPathState.setFocus(downstairsNeighborPath, getFocusPosition(editor));
      } catch (e) {
        if (e instanceof NoSuchBlockError) {
          return fullPathState;
        }
        throw e;
      }
    });
    return ALLOW_TIPTAP_DEFAULT;
  };

  const handleLeftArrowPress = (editor: Editor) => {
    logKeyEvent("onLeftArrowPress, path: " + propsRef.current.path);
    const focusPosition = getFocusPosition(editor);
    if (focusPosition === 1) {
      // we're at the beginning of the line already, so graphDispatch the action
      if (isRootRef.current) {
        return ALLOW_TIPTAP_DEFAULT;
      }
      fullPathDispatch((fullPathState: IFullPath): IFullPath => {
        const upstairsNeighborPath = getUpstairsNeighborPath(propsRef.current.path);
        return fullPathState.setFocus(upstairsNeighborPath, "end");
      });
      return PREVENT_TIPTAP_DEFAULT;
    }
    return ALLOW_TIPTAP_DEFAULT;
  };

  const handleRightArrowPress = (editor: Editor) => {
    logKeyEvent("onRightArrowPress, path: " + propsRef.current.path);
    const focusPosition = getFocusPosition(editor);
    if (focusPosition === editor.getText().length + 1) {
      // we're at the end of the line already, so graphDispatch the action
      fullPathDispatch((fullPathState: IFullPath): IFullPath => {
        try {
          const downstairsNeighborPath = getDownstairsNeighborPath(propsRef.current.path);
          return fullPathState.setFocus(downstairsNeighborPath, "start");
        } catch (e) {
          if (e instanceof NoSuchBlockError) {
            return fullPathState;
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
      // we're at the beginning of the line already, so graphDispatch the action
      graphDispatch((graphState: IGraph) => {
        const upstairsNeighborPath = getUpstairsNeighborPath(propsRef.current.path);
        const upstairsNeighborContent = getContentFromPath({
          focusPath: upstairsNeighborPath,
        });
        const upstairsNeighborHasLocation = upstairsNeighborPath.length > 0;
        if (
          upstairsNeighborContent.childLocatedBlocks.length <= 1 &&
          upstairsNeighborContent.locatedBlocks.length <= 1 &&
          upstairsNeighborContent.humanText.length === 0 &&
          upstairsNeighborHasLocation
        ) {
          // if the upstairs neighbor is a simple blank line with a single parent and no children,
          // we shift the current line up to replace the upstairs neighbor
          // we do this even when the current block has multiple parents
          const upstairsNeighborLocatedBlockId =
            upstairsNeighborPath[upstairsNeighborPath.length - 1];
          const upstairsNeighborLocatedBlock = graphState.locatedBlocks.get(
            upstairsNeighborLocatedBlockId
          );
          const newPath = [...upstairsNeighborPath.slice(0, -1), locatedRef.current.id];
          fullPathDispatch((fullPathState: IFullPath): IFullPath => {
            return fullPathState.setFocus(newPath, "start");
          });
          return graphState
            .removeLocatedBlock(upstairsNeighborLocatedBlockId)
            .moveLocatedBlock(
              locatedRef.current.id,
              upstairsNeighborLocatedBlock.leftId,
              upstairsNeighborLocatedBlock.parentId
            )
        } else if (contentRef.current.locatedBlocks.length > 1) {
          // if the current block has multiple parents and the upstairs neighbor is non-simple,
          // we don't do anything
          return graphState;
        } else if (
          contentRef.current.childLocatedBlocks.length > 0 &&
          upstairsNeighborContent.childLocatedBlocks.length > 1
        ) {
          // if both merging blocks have children, that's weird and we don't do anything
          return graphState;
        } else {
          // in all other cases,
          // we merge current block into upstairs neighbor, maintaining upstairs neighbor's id
          fullPathDispatch((fullPathState: IFullPath): IFullPath => {
            return fullPathState.setFocus(
              upstairsNeighborPath,
              upstairsNeighborContent.humanText.length + 1
            );
          });
          return graphState
            .removeLocatedBlock(locatedRef.current.id)
            .updateBlockText(
              upstairsNeighborContent.id,
              upstairsNeighborContent.humanText + editorText
            )
        }
      });
      return PREVENT_TIPTAP_DEFAULT;
    }
    return ALLOW_TIPTAP_DEFAULT;
  };

  const handleTabPress = (editor: Editor) => {
    logKeyEvent("onTabPress, path: " + propsRef.current.path);
    const focusPosition = getFocusPosition(editor);
    graphDispatch((graphState: IGraph) => {
      if (isRootRef.current) {
        // if we're at the root, we don't do anything
        return graphState;
      }
      let focusPath: Path;
      let parentContent = graphState.blockContents.get(locatedRef.current.parentId);
      if (parentContent.getLeftmostChildId() === locatedRef.current.id) {
        // if we're the first child, just add an older sibling and proceed, don't return yet
        const newLocatedBlockId = crypto.randomUUID();
        graphState = graphState.insertNewBlock(
          null,
          parentContent.id,
          "",
          contentRef.current.verb.getDefaultParentVerb(),
          newLocatedBlockId
        );
        parentContent = graphState.blockContents.get(parentContent.id);
        focusPath = [...propsRef.current.path.slice(0, -1), newLocatedBlockId];
      } else {
        focusPath = [
          ...propsRef.current.path.slice(0, -1),
          parentContent.getLeftSiblingIdOf(locatedRef.current.id),
          locatedRef.current.id,
        ];
      }
      const updatedLeftSibling = parentContent.getLeftSiblingIdOf(locatedRef.current.id);
      const leftSiblingBlock = fullBlockFromLocatedBlockId(graphState, updatedLeftSibling);
      fullPathDispatch((fullPathState: IFullPath): IFullPath => {
        return fullPathState.setFocus(focusPath, focusPosition);
      });
      return graphState
        .moveLocatedBlock(
          locatedRef.current.id,
          leftSiblingBlock.blockContent.getRightmostChildId(),
          leftSiblingBlock.blockContent.id
        )
    });
    return PREVENT_TIPTAP_DEFAULT;
  };

  const handleShiftTabPress = (editor: Editor) => {
    logKeyEvent("onShiftTabPress, path: " + propsRef.current.path);
    const focusPosition = getFocusPosition(editor);
    graphDispatch((graphState: IGraph) => {
      if (propsRef.current.path.length < 2) {
        // If there's no granparent, we don't do anything
        return graphState;
      }
      const parentLocatedBlockId = propsRef.current.path[propsRef.current.path.length - 2];
      const parentBlock = fullBlockFromLocatedBlockId(graphState, parentLocatedBlockId);
      const rightSiblingLocatedId = parentBlock.blockContent.getRightSiblingIdOf(
        locatedRef.current.id
      );
      const focusPath = [...propsRef.current.path.slice(0, -2), locatedRef.current.id];
      const updatedgraphState = graphState
        .moveLocatedBlock(
          locatedRef.current.id,
          parentLocatedBlockId,
          parentBlock.locatedBlock.parentId
        )
      if (rightSiblingLocatedId) {
        return updatedgraphState.moveChildren(rightSiblingLocatedId, contentRef.current.id);
      }
      fullPathDispatch((fullPathState: IFullPath): IFullPath => {
        return fullPathState.setFocus(focusPath, focusPosition);
      });
      return updatedgraphState;
    });
    return PREVENT_TIPTAP_DEFAULT;
  };

  const handlePaste = async () => {
    logKeyEvent("onPaste, path: " + propsRef.current.path);
    const pasteAction: GraphAction = pasteActionGenerator(
      locatedRef.current.id,
      await navigator.clipboard.readText(),
      graphState,
      fullPathState,
      fullPathDispatch,
      getContentFromPath
    );
    graphDispatch(pasteAction);
  };

  // keep propsRef up to date
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  // keep locatedRef and contentRef and isRootRef up to date
  useEffect(() => {
    contentRef.current = graphState.blockContents.get(props.contentId);
    if (props.path.length > 0) {
      locatedRef.current = graphState.locatedBlocks.get(props.path[props.path.length - 1]);
      isRootRef.current = false;
    } else {
      locatedRef.current = null;
      isRootRef.current = true;
    }
  }, [props.path, props.contentId]);

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

  // set editor focus based on whether graphState's focusPath is this block's path
  useEffect(() => {
    if (editor && !editor.isDestroyed && fullPathState) {
      if (pathEquals(fullPathState.focusPath, props.path)) {
        logEffect(
          "setting focus for path: " +
            props.path +
            ", focus position: " +
            fullPathState.focusPosition
        );
        editor.commands.setContent(props.humanText);
        editor.commands.focus(fullPathState.focusPosition);
      } else {
        isFocused.current = false;
      }
    }
  }, [!!editor, fullPathState.focusPath]);

  const rootClass = isRootRef.current ? "text-xl font-bold" : "";

  return (
    <div
      {...mouseEvents}
      className={`flex-grow ${selectedClass} ${containerDeepSelectedClass} ${rootClass}`}
    >
      <EditorContent editor={editor} />
    </div>
  );
};
