import { Editor } from "@tiptap/core";
import Blockquote from "@tiptap/extension-blockquote";
import Bold from "@tiptap/extension-bold";
import BulletList from "@tiptap/extension-bullet-list";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import Document from "@tiptap/extension-document";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";
import HardBreak from "@tiptap/extension-hard-break";
import Heading from "@tiptap/extension-heading";
import History from "@tiptap/extension-history";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Italic from "@tiptap/extension-italic";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
import Strike from "@tiptap/extension-strike";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import { MutableRefObject, useEffect, useRef } from "react";
import { NoSuchBlockError } from "../../../lib/errors";
import { getFocusPosition, pathEquals } from "../../../lib/helpers";
import { logEditorEvent, logEffect, logKeyEvent, logMouseEvent } from "../../../lib/loggers";
import { pasteActionGenerator } from "../../../lib/paste";
import { BlockContentId, HumanText, IBlockContent } from "../../../model/graph/blockContent";
import { fullBlockFromLocatedBlockId } from "../../../model/graph/fullBlock";
import { IGraph, Path } from "../../../model/graph/graph";
import { enterPressActionGenerator } from "../../../model/graph/graphActions";
import { ILocatedBlock } from "../../../model/graph/locatedBlock";
import {
  getContentFromPath,
  getDownstairsNeighborPath,
  getUpstairsNeighborPath,
} from "../../../model/graphWithView";
import { IView } from "../../../model/view";
import { GraphAction, useGraph } from "../../GraphProvider";
import { useView } from "../../ViewProvider";

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
  const { graphState, graphDispatch } = useGraph();
  const { viewState, viewDispatch } = useView();
  const contentRef: MutableRefObject<IBlockContent> = useRef(
    graphState.blockContents.get(props.contentId)
  );
  const locatedRef: MutableRefObject<null | ILocatedBlock> = useRef(null);
  const isRootRef: MutableRefObject<boolean> = useRef(true);
  const graphRef: MutableRefObject<IGraph> = useRef(graphState);
  const viewRef: MutableRefObject<IView> = useRef(viewState);
  if (props.path.size > 0) {
    isRootRef.current = false;
    locatedRef.current = graphState.locatedBlocks.get(props.path.last());
  }
  let isFocused = useRef(false); // whether the current text is focused
  let propsRef = useRef(props); // yuck: using this to forego stale closures

  // keep propsRef up to date
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  // keep locatedRef and contentRef and isRootRef up to date
  useEffect(() => {
    contentRef.current = graphState.blockContents.get(props.contentId);
    if (props.path.size > 0) {
      locatedRef.current = graphState.locatedBlocks.get(props.path.last());
      isRootRef.current = false;
    } else {
      locatedRef.current = null;
      isRootRef.current = true;
    }
  }, [props.path, props.contentId]);

  // keep graphRef up to date
  useEffect(() => {
    graphRef.current = graphState;
  }, [graphState]);

  // keep viewRef up to date
  useEffect(() => {
    viewRef.current = viewState;
  }, [viewState]);

  const click = () => {
    logMouseEvent("onClick " + props.humanText);
  };

  const mouseEnter = (e: React.MouseEvent) => {
    if (isMouseDown(e)) {
      logMouseEvent("onMouseEnter mouseIsDown " + props.humanText);
      graphDispatch((state: IGraph) => {
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
        graphDispatch((state: IGraph) => {
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
    graphDispatch((state: IGraph) => {
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

  const humanTextToJSONContent = (humanText: HumanText) => {
    try {
      return { type: "doc", content: JSON.parse(props.humanText) };
    } catch (e) {
      return {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", content: humanText }] }],
      };
    }
  };

  const humanTextToEditor = (editor: Editor, humanText: string) => {
    editor.commands.setContent(humanTextToJSONContent(humanText));
  };

  const editorToHumanTextJSON = (editor: Editor) => {
    return editor.getJSON().content;
  };

  const editorToHumanText = (editor: Editor): string => {
    return JSON.stringify(editorToHumanTextJSON(editor));
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
      extensions: [
        CustomExtension,
        Paragraph,
        Text,
        Blockquote,
        Bold,
        Italic,
        Strike,
        Heading,
        ListItem,
        BulletList,
        OrderedList,
        HorizontalRule,
        CodeBlock,
        Code,
        HardBreak,
        Dropcursor,
        Gapcursor,
        History,
      ],
      editorProps: {
        attributes: {
          class: `focus:outline-none text-gray-700 py-0.5 ${selectedClass}`,
        },
        handlePaste: (view) => {
          view.focus();
          handlePaste();
          return PREVENT_TIPTAP_DEFAULT;
        },
      },
      editable: !props.isGlobalSelectionActive,
      content: humanTextToJSONContent(props.humanText),
      onUpdate({ editor }) {
        logEditorEvent("onUpdate:" + propsRef.current.path);
        graphDispatch((state: IGraph) => {
          return state.updateBlockText(contentRef.current.id, editorToHumanText(editor));
        });
      },
      onFocus({ transaction }) {
        logEditorEvent("onFocus: [" + propsRef.current.path);
        viewDispatch((state: IView) => {
          return state.setFocusPath(propsRef.current.path);
        });
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
    editor.commands.splitBlock();
    graphDispatch(
      enterPressActionGenerator(
        locatedRef.current,
        contentRef.current,
        isRootRef.current,
        editorToHumanTextJSON(editor),
        propsRef.current.path,
        viewDispatch
      )
    );
    return PREVENT_TIPTAP_DEFAULT;
  };

  const handleUpArrowPress = (editor: Editor) => {
    logKeyEvent("onUpArrowPress, path: " + propsRef.current.path);
    if (isRootRef.current) {
      return ALLOW_TIPTAP_DEFAULT;
    }
    viewDispatch((state: IView): IView => {
      const upstairsNeighborPath = getUpstairsNeighborPath(
        graphRef.current,
        state,
        propsRef.current.path
      );
      return state.setFocus(upstairsNeighborPath, getFocusPosition(editor));
    });
    return PREVENT_TIPTAP_DEFAULT;
  };

  const handleDownArrowPress = (editor: Editor) => {
    logKeyEvent("onDownArrowPress, path: " + propsRef.current.path);
    viewDispatch((state: IView): IView => {
      try {
        const downstairsNeighborPath = getDownstairsNeighborPath(
          graphRef.current,
          state,
          propsRef.current.path
        );
        return state.setFocus(downstairsNeighborPath, getFocusPosition(editor));
      } catch (e) {
        if (e instanceof NoSuchBlockError) {
          return state;
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
      viewDispatch((state: IView): IView => {
        const upstairsNeighborPath = getUpstairsNeighborPath(
          graphRef.current,
          state,
          propsRef.current.path
        );
        return state.setFocus(upstairsNeighborPath, "end");
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
      viewDispatch((state: IView): IView => {
        try {
          const downstairsNeighborPath = getDownstairsNeighborPath(
            graphRef.current,
            state,
            propsRef.current.path
          );
          return state.setFocus(downstairsNeighborPath, "start");
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
    const editorText = editorToHumanText(editor);
    const focusPosition = getFocusPosition(editor);
    if (focusPosition === 1 && !isRootRef.current) {
      // we're at the beginning of the line already, so graphDispatch the action
      graphDispatch((state: IGraph) => {
        const upstairsNeighborPath = getUpstairsNeighborPath(
          state,
          viewRef.current,
          propsRef.current.path
        );
        const upstairsNeighborContent = getContentFromPath(state, viewRef.current, {
          focusPath: upstairsNeighborPath,
        });
        if (
          contentRef.current.childLocatedBlocks.size > 0 &&
          upstairsNeighborContent.childLocatedBlocks.size > 1
        ) {
          // if both merging blocks have children, that's weird and we don't do anything
          return state;
        }
        const upstairsNeighborHasLocation = upstairsNeighborPath.size > 0;
        if (
          upstairsNeighborContent.childLocatedBlocks.size <= 1 &&
          upstairsNeighborContent.locatedBlocks.size <= 1 &&
          upstairsNeighborContent.humanText.length === 0 &&
          upstairsNeighborHasLocation
        ) {
          // if the upstairs neighbor is a simple blank line with a single parent and no children,
          // we shift the current line up to replace the upstairs neighbor
          // we do this even when the current block has multiple parents
          const upstairsNeighborLocatedBlockId = upstairsNeighborPath.last();
          const upstairsNeighborLocatedBlock = state.locatedBlocks.get(
            upstairsNeighborLocatedBlockId
          );
          const newPath = upstairsNeighborPath.splice(-1, 1, locatedRef.current.id);
          viewDispatch((state: IView): IView => {
            return state.setFocus(newPath, "start");
          });
          return state
            .moveLocatedBlock(
              locatedRef.current.id,
              upstairsNeighborLocatedBlock.leftId,
              upstairsNeighborLocatedBlock.parentId
            )
            .removeLocatedBlock(upstairsNeighborLocatedBlockId);
        }
        if (contentRef.current.locatedBlocks.size > 1) {
          // if the current block has multiple parents and the upstairs neighbor is non-simple,
          // we don't do anything
          return state;
        }
        // in all other cases,
        // we merge current block into upstairs neighbor, maintaining upstairs neighbor's id
        viewDispatch((state: IView): IView => {
          return state.setFocus(upstairsNeighborPath, upstairsNeighborContent.humanText.length + 1);
        });
        const upstairs = JSON.parse(upstairsNeighborContent.humanText) as [];
        const downstairs = JSON.parse(editorText) as [];
        return state
          .moveChildren(contentRef.current.getLeftmostChildId(), upstairsNeighborContent.id)
          .removeLocatedBlock(locatedRef.current.id)
          .updateBlockText(
            upstairsNeighborContent.id,
            JSON.stringify([...upstairs, ...downstairs])
          );
      });
      return PREVENT_TIPTAP_DEFAULT;
    }
    return ALLOW_TIPTAP_DEFAULT;
  };

  const handleTabPress = (editor: Editor) => {
    logKeyEvent("onTabPress, path: " + propsRef.current.path);
    const focusPosition = getFocusPosition(editor);
    if (!isRootRef.current) {
      graphDispatch((state: Readonly<IGraph>) => {
        let focusPath: Path;
        let newState: IGraph = state;
        let parentContent = newState.blockContents.get(locatedRef.current.parentId);
        if (parentContent.getLeftmostChildId() === locatedRef.current.id) {
          // if we're the first child, just add an older sibling and proceed, don't return yet
          const newLocatedBlockId = crypto.randomUUID();
          newState = newState.insertNewBlock(
            null,
            parentContent.id,
            "",
            contentRef.current.verb.getDefaultParentVerb(),
            newLocatedBlockId
          );
          parentContent = newState.blockContents.get(parentContent.id);
          focusPath = propsRef.current.path.splice(-1, 1, newLocatedBlockId);
        } else {
          focusPath = propsRef.current.path.splice(
            -1,
            1,
            parentContent.getLeftSiblingIdOf(locatedRef.current.id),
            locatedRef.current.id
          );
        }
        const updatedLeftSibling = parentContent.getLeftSiblingIdOf(locatedRef.current.id);
        const { blockContent: leftSiblingBlockContent } = fullBlockFromLocatedBlockId(
          newState,
          updatedLeftSibling
        );
        viewDispatch((state: IView): IView => {
          return state.setFocus(focusPath, focusPosition);
        });
        newState = newState.moveLocatedBlock(
          locatedRef.current.id,
          leftSiblingBlockContent.getRightmostChildId(),
          leftSiblingBlockContent.id
        );
        return newState;
      });
    }
    return PREVENT_TIPTAP_DEFAULT;
  };

  const handleShiftTabPress = (editor: Editor) => {
    logKeyEvent("onShiftTabPress, path: " + propsRef.current.path);
    const focusPosition = getFocusPosition(editor);
    graphDispatch((state: IGraph) => {
      if (propsRef.current.path.size < 2) {
        // If there's no granparent, we don't do anything
        return state;
      }
      const parentLocatedBlockId = propsRef.current.path.get(propsRef.current.path.size - 2);
      const parentBlock = fullBlockFromLocatedBlockId(state, parentLocatedBlockId);
      const rightSiblingLocatedId = parentBlock.blockContent.getRightSiblingIdOf(
        locatedRef.current.id
      );
      const focusPath = propsRef.current.path.splice(-2, 2, locatedRef.current.id);
      const updatedgraphState = state.moveLocatedBlock(
        locatedRef.current.id,
        parentLocatedBlockId,
        parentBlock.locatedBlock.parentId
      );
      viewDispatch((state: IView): IView => {
        return state.setFocus(focusPath, focusPosition);
      });
      if (rightSiblingLocatedId) {
        return updatedgraphState.moveChildren(rightSiblingLocatedId, contentRef.current.id);
      }
      return updatedgraphState;
    });
    return PREVENT_TIPTAP_DEFAULT;
  };

  const handlePaste = async () => {
    logKeyEvent("onPaste, path: " + propsRef.current.path);
    const pasteAction: GraphAction = pasteActionGenerator(
      locatedRef.current.id,
      await navigator.clipboard.readText(),
      viewState,
      viewDispatch
    );
    graphDispatch(pasteAction);
  };

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
        if (props.humanText !== editorToHumanText(editor)) {
          logEffect("updating editor content for path: " + props.path);
          humanTextToEditor(editor, props.humanText);
        }
      }
    }
  }, [!!editor, props.humanText, isFocused.current]);

  // the one exception to the above; we force update editor content when contentId changes
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      if (props.humanText !== editorToHumanText(editor)) {
        logEffect("updating editor content for path: " + props.path + " due to contentId change");
        humanTextToEditor(editor, props.humanText);
      }
    }
  }, [!!editor, props.contentId]);

  // set editor focus based on whether graphState's focusPath is this block's path
  useEffect(() => {
    if (editor && !editor.isDestroyed && viewState) {
      if (pathEquals(viewState.focusPath, props.path) && !isFocused.current) {
        logEffect(
          "setting focus for path: " + props.path + ", focus position: " + viewState.focusPosition
        );
        humanTextToEditor(editor, props.humanText);
        editor.commands.focus(viewState.focusPosition);
      } else {
        isFocused.current = false;
      }
    }
  }, [!!editor, viewState.focusPath]);

  useEffect(
    () => () => {
      // TODO this might be useful, but there's still the same console warning: can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
      if (editor && !editor.isDestroyed) {
        editor.destroy();
      }
    },
    []
  );

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
