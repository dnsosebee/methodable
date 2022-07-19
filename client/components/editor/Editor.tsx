import { List, Map } from "immutable";
import { KeyboardEvent, useState } from "react";
import {
  PATH_DELIMITER,
  PATH_SEPARATOR,
  SELECTION_BASE_URL,
} from "../../../pages/[mode]/[rootContentId]";
import { logAction, logKeyEvent } from "../../lib/loggers";
import { BlockContentId, IBlockContent } from "../../model/graph/blockContent";
import { fullBlockFromLocatedBlockId, IFullBlock } from "../../model/graph/fullBlock";
import {
  cloneGraph,
  createGraph,
  graphFromJson,
  graphToJson,
  IGraph,
  isChildBetweenSelection,
} from "../../model/graph/graph";
import { ILocatedBlock, LocatedBlockId } from "../../model/graph/locatedBlock";
import { getContentFromPath } from "../../model/graphWithView";
import { IEditor } from "../../model/modes/editor";
import { createVerb, VERB } from "../../model/verbs/verb";
import { createView, IView } from "../../model/view";
import { useGraph } from "../GraphProvider";
import { Guide } from "../guide/Guide";
import { useView } from "../ViewProvider";
import { Wrapper } from "../Wrapper";
import { Block, IBlockProps } from "./block/Block";
import { Breadcrumbs, IBreadcrumbsProps } from "./Breadcrumbs";
import { useEditor } from "./EditorProvider";
import { Search } from "./Search";

export const Editor = () => {
  const { graphState, graphDispatch } = useGraph();
  const { viewState, viewDispatch } = useView();
  const { editorState, editorDispatch } = useEditor();
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  // try {
  //   const { guideState } = useGuide();
  //   if (isPreviewActive) {
  //     setIsPreviewActive(false);
  //   }
  // } catch (e) {
  //   // just using the try-catch to see if we're in a guide page
  // }

  let rootContent;
  try {
    rootContent = getContentFromPath(graphState, viewState, {});
  } catch {
    return null;
  }

  const rootBlockProps: IBlockProps = {
    path: List(),
    content: rootContent,
    isShallowSelected: false,
    isDeepSelected: false,
    isGlobalSelectionActive: editorState.isSelectionActive,
    parentVerb: createVerb(VERB.UNDEFINED),
    orderIndex: 0,
  };

  // shallow
  const getShallowClipboardVals = (): string => {
    const parent = getContentFromPath(graphState, viewState, {
      focusPath: editorState.activeParentPath,
    });
    const children = parent.childLocatedBlocks;
    const bound1 = editorState.selectionRange.start.get(editorState.activeParentPath.size);
    const bound2 = editorState.selectionRange.end.get(editorState.activeParentPath.size);
    let result = "";
    for (let i = 0; i < children.size; i++) {
      const childId = children.get(i);
      if (parent.isChildBetween(childId, bound1, bound2)) {
        result +=
          SELECTION_BASE_URL +
          viewState.rootContentId +
          "/" +
          viewState.rootRelativePath.join(PATH_DELIMITER) +
          PATH_SEPARATOR +
          editorState.activeParentPath.join(PATH_DELIMITER) +
          (editorState.activeParentPath.size > 0 ? PATH_DELIMITER : "") +
          childId +
          "\n";
      }
    }
    return result.trim();
  };

  // deep
  // TODO implement
  const getDeepClipboardVals = (): string => {
    return getShallowClipboardVals();
  };

  const copyHandler = async () => {
    if (editorState.isSelectionActive) {
      const clipboardVals = editorState.isSelectionByText
        ? getDeepClipboardVals()
        : getShallowClipboardVals();
      logKeyEvent("copy:\n" + clipboardVals);
      await navigator.clipboard.writeText(clipboardVals);
    }
  };

  const toggleSelectionDepth = () => {
    logAction("toggleSelectionDepth");
    editorDispatch((state: IEditor): IEditor => {
      return state.toggleSelectionType();
    });
  };

  // const toggleSelectionText = editorState.isSelectionByText ? "select text" : "select references";
  const buttonClasses = (isActive: boolean) =>
    `${
      isActive ? "bg-gray-200 text-black" : "bg-gray-100 text-gray-300"
    } shadow flex-none text-xs hover:bg-gray-200 select-none mb-2 rounded px-1 py-0.5 max-w-48 mr-2`;
  const breadcrumbProps: IBreadcrumbsProps = {
    rootContentId: viewState.rootContentId,
    rootRelativePath: viewState.rootRelativePath,
  };

  const saveHandler = async () => {
    const graphStateJson = graphToJson(graphState);
    try {
      const newHandle = await window.showSaveFilePicker({ suggestedName: "my_programs.json" });
      const writableStream = await newHandle.createWritable();
      await writableStream.write(graphStateJson);
      await writableStream.close();
    } catch (e) {
      console.error(e);
    }
  };

  // currently it's unnecessary to clone here, since we clone on add/load
  const saveProgramHandler = async () => {
    const content = getContentFromPath(graphState, viewState, {});
    let fullBlocks: Map<LocatedBlockId, IFullBlock> = Map();
    const addFullBlocks = (content: IBlockContent) => {
      content.childLocatedBlocks.forEach((childLocatedId) => {
        if (!fullBlocks.has(childLocatedId)) {
          const childFullBlock = fullBlockFromLocatedBlockId(graphState, childLocatedId);
          fullBlocks = fullBlocks.set(childLocatedId, childFullBlock);
          addFullBlocks(childFullBlock.blockContent);
        }
      });
    };
    addFullBlocks(content);
    let locatedBlocks = Map<LocatedBlockId, ILocatedBlock>();
    let blockContents = Map<BlockContentId, IBlockContent>();
    fullBlocks.forEach((fullBlock) => {
      locatedBlocks = locatedBlocks.set(fullBlock.locatedBlock.id, fullBlock.locatedBlock);
      blockContents = blockContents.set(fullBlock.blockContent.id, fullBlock.blockContent);
    });
    blockContents = blockContents.set(content.id, content);
    const stateToSave: IGraph = {
      ...graphState,
      locatedBlocks,
      blockContents,
    };
    const graphStateJson = graphToJson(stateToSave);
    // alert(
    //   `You are saving a copy of everything within the scope of the program: ${content.humanText}\n\nTo save a different program, go to the page for that program, then click the "Save" button.`
    // );
    try {
      const newHandle = await window.showSaveFilePicker({
        suggestedName: `${content.humanText
          .substring(0, 20)
          .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
          .replace(/ /g, "_")}.method`,
      });
      const writableStream = await newHandle.createWritable();
      await writableStream.write(graphStateJson);
      await writableStream.close();
    } catch (e) {
      console.error(e);
    }
  };

  // const loadHandler = async () => {
  //   try {
  //     const [fileHandle] = await window.showOpenFilePicker({
  //       types: [
  //         {
  //           description: "JSON",
  //           accept: {
  //             "application/*": [".json"],
  //           },
  //         },
  //       ],
  //       excludeAcceptAllOption: true,
  //       multiple: false,
  //     });

  //     // get file contents
  //     const fileData = await fileHandle.getFile();
  //     const stringData = await fileData.text();
  //     graphDispatch((state: IGraph): IGraph => {
  //       return graphFromJson(stringData);
  //     });
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  const addHandler = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            accept: {
              "application/*": [".method"],
            },
          },
        ],
        excludeAcceptAllOption: true,
        multiple: false,
      });

      // get file contents
      const fileData = await fileHandle.getFile();
      const stringData = await fileData.text();
      // clone to avoid collisions
      let incomingGraph: IGraph = cloneGraph(graphFromJson(stringData));
      const incomingRootContent = incomingGraph.blockContents.find((value) => {
        return value.locatedBlocks.size === 0;
      });
      graphDispatch((state: IGraph): IGraph => {
        const updatedGraph = createGraph({
          blockContents: state.blockContents.merge(incomingGraph.blockContents),
          locatedBlocks: state.locatedBlocks.merge(incomingGraph.locatedBlocks),
        });
        const newLocatedBlockId = crypto.randomUUID();
        viewDispatch((state: IView): IView => {
          return createView({
            mode: state.mode,
            rootContentId: "home",
            rootRelativePath: List([newLocatedBlockId]),
            focusPath: List(),
            focusPosition: "end",
          });
        });
        return updatedGraph.insertNewLocatedBlock(
          null,
          "home",
          incomingRootContent.id,
          newLocatedBlockId
        );
      });
    } catch (e) {
      console.error(e);
    }
  };

  // TODO this is broken, only the delete references button works
  const keyDownHandler = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Backspace":
        handleBackspace();
    }
  };

  const handleBackspace = () => {
    if (editorState.isSelectionActive && !editorState.isSelectionByText) {
      logKeyEvent("Backspace");
      graphDispatch((state: IGraph): IGraph => {
        const locatedBlocksToRemove = [];
        const activeParentContent = getContentFromPath(state, viewState, {
          focusPath: editorState.activeParentPath,
        });
        activeParentContent.childLocatedBlocks.forEach((childLocatedId) => {
          if (isChildBetweenSelection(state, editorState, childLocatedId)) {
            locatedBlocksToRemove.push(childLocatedId);
          }
        });
        locatedBlocksToRemove.forEach((locatedBlockId) => {
          state = state.removeLocatedBlock(locatedBlockId);
        });
        editorDispatch((state: IEditor): IEditor => {
          return state.endSelection();
        });
        return state;
      });
    }
  };

  const togglePreview = () => {
    setIsPreviewActive(!isPreviewActive);
  };

  return (
    <Wrapper shouldGrow={false}>
      <div className="flex-grow flex max-h-full">
        <div
          onCopy={copyHandler}
          onKeyDown={keyDownHandler}
          className="flex-1 overflow-auto font-sans"
        >
          <Search />
          <div className="flex border-b mb-1 select-none">
            <span className="mx-2 text-sm">Options:</span>
            {/* <button
              onClick={toggleSelectionDepth}
              className={buttonClasses(editorState.isSelectionActive)}
            >
              {toggleSelectionText}
            </button> */}
            <button
              onClick={handleBackspace}
              className={buttonClasses(editorState.isSelectionActive)}
            >
              delete references
            </button>
            <button onClick={saveHandler} className={buttonClasses(true)}>
              Save Programs
            </button>
            <button onClick={saveProgramHandler} className={buttonClasses(true)}>
              Save
            </button>
            {/* <button onClick={loadHandler} className={buttonClasses(true)}>
              Load Programs
            </button> */}
            <button onClick={addHandler} className={buttonClasses(true)}>
              Load
            </button>
            <button
              onClick={togglePreview}
              className={`${buttonClasses(true)} bg-blue-100 hover:bg-blue-200`}
            >
              {isPreviewActive ? "Hide Preview" : "Show Preview"}
            </button>
          </div>
          {viewState.rootRelativePath.size > -1 ? <Breadcrumbs {...breadcrumbProps} /> : null}
          <Block {...rootBlockProps} />
        </div>
        {isPreviewActive ? (
          <div className="flex-1 flex flex-col max-h-full ml-2">
            <Guide {...{ editorState, viewState }} />
          </div>
        ) : null}
      </div>
    </Wrapper>
  );
};
