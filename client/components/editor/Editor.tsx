import { List, Map } from "immutable";
import { KeyboardEvent, useState } from "react";
import { PATH_DELIMITER, PATH_SEPARATOR, SELECTION_BASE_URL } from "../../lib/constants";
import { logAction, logKeyEvent } from "../../lib/loggers";
import { BlockContentId, IBlockContent } from "../../model/graph/blockContent";
import { fullBlockFromLocatedBlockId, IFullBlock } from "../../model/graph/fullBlock";
import {
  cloneGraph,
  createGraph,
  graphFromJson,
  graphToJson,
  IGraph,
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

export interface IEditorProps {
  showOptions: boolean;
  showSearch: boolean;
  shortenWrapper: boolean;
}

export const isChildBetweenSelection = (
  graph: IGraph,
  editor: IEditor,
  locatedBlockId: LocatedBlockId
) => {
  const parentPathLength = editor.activeParentPath.size;
  const bound1 = editor.selectionRange.start.get(parentPathLength);
  const bound2 = editor.selectionRange.end.get(parentPathLength);
  const bound1LocatedBlock = graph.locatedBlocks.get(bound1);
  const parentContent = graph.blockContents.get(bound1LocatedBlock.parentId);
  return parentContent.isChildBetween(locatedBlockId, bound1, bound2);
};

export const Editor = (props: IEditorProps) => {
  const { showOptions, showSearch } = props;
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
    collapsed: false,
    setCollapsed: () => {},
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
      isActive ? "bg-gray-200 text-black hover:bg-gray-300" : "bg-gray-50 text-gray-200"
    } shadow flex-none text-xs select-none mb-2 rounded-lg px-2 py-0.5 max-w-48 ml-2`;
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

  const showBreadcrumbs = viewState.rootRelativePath.size > 0;
  const maxH = showBreadcrumbs
    ? showSearch
      ? "max-h-[calc(100%-95px)]"
      : "max-h-[calc(100%-65px)]"
    : showSearch
    ? "max-h-[calc(100%-65px)]"
    : "max-h-[calc(100%-35px)]";

  return (
    <Wrapper
      shouldGrow={false}
      className={`bg-gray-50 ${props.shortenWrapper ? "max-h-[calc(100%_-_40px)]" : "max-h-full"}`}
    >
      <div className="flex-grow flex max-h-[calc(100%_-_2px)]">
        <div onCopy={copyHandler} onKeyDown={keyDownHandler} className="flex-1 font-sans">
          {showSearch && <Search />}
          {showOptions && (
            <div className="flex border-b mb-1 select-none">
              <span className="mx-2 text-sm">Options:</span>
              <div className="flex-grow flex overflow-x-auto">
                {/* <button
              onClick={toggleSelectionDepth}
              className={buttonClasses(editorState.isSelectionActive)}
            >
              {toggleSelectionText}
            </button> */}

                {/* <button onClick={saveHandler} className={buttonClasses(true)}>
                  Save Programs
                </button> */}
                <button onClick={saveProgramHandler} className={buttonClasses(true)}>
                  Save Program to File
                </button>
                {/* <button onClick={loadHandler} className={buttonClasses(true)}>
              Load Programs
            </button> */}
                <button onClick={addHandler} className={buttonClasses(true)}>
                  Open File
                </button>
                {editorState.isSelectionActive && (
                  <button
                    onClick={handleBackspace}
                    className={` bg-red-300 hover:bg-red-400 shadow flex-none text-xs select-none mb-2 rounded-lg px-2 py-0.5 max-w-48 ml-2`}
                  >
                    delete references
                  </button>
                )}
                <div className="mr-2"></div>
                <button onClick={togglePreview} className={`${buttonClasses(true)} ml-auto`}>
                  {isPreviewActive ? "Hide Preview" : "Show Side-by-Side Preview"}
                </button>
              </div>
            </div>
          )}
          {showBreadcrumbs ? (
            <div className="flex overflow-x-auto w-full">
              {" "}
              <Breadcrumbs {...breadcrumbProps} />
            </div>
          ) : null}
          <div className={`flex ${maxH}`}>
            <Block {...rootBlockProps} />
          </div>
        </div>
        {isPreviewActive ? (
          <div className="flex-1 flex flex-col max-h-full ml-3">
            <Guide {...{ editorState, viewState }} />
          </div>
        ) : null}
      </div>
    </Wrapper>
  );
};
