import { List } from "immutable";
import { KeyboardEvent, useState } from "react";
import {
  PATH_DELIMITER,
  PATH_SEPARATOR,
  SELECTION_BASE_URL,
} from "../../../pages/[mode]/[rootContentId]";
import { logAction, logKeyEvent } from "../../lib/loggers";
import {
  graphFromJson,
  graphToJson,
  IGraph,
  isChildBetweenSelection,
} from "../../model/graph/graph";
import { getContentFromPath } from "../../model/graphWithView";
import { createVerb, VERB } from "../../model/verbs/verb";
import { useGraph } from "../GraphProvider";
import { Guide } from "../guide/Guide";
import { useView } from "../ViewProvider";
import { Wrapper } from "../Wrapper";
import { Block, IBlockProps } from "./block/Block";
import { Breadcrumbs, IBreadcrumbsProps } from "./Breadcrumbs";

export const Editor = () => {
  const { graphState, graphDispatch } = useGraph();
  const { viewState } = useView();
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  const rootContent = getContentFromPath(graphState, viewState, {});

  const rootBlockProps: IBlockProps = {
    path: List(),
    content: rootContent,
    isShallowSelected: false,
    isDeepSelected: false,
    isGlobalSelectionActive: graphState.isSelectionActive,
    parentVerb: createVerb(VERB.UNDEFINED),
    orderIndex: 0,
  };

  // shallow
  const getShallowClipboardVals = (): string => {
    const parent = getContentFromPath(graphState, viewState, {
      focusPath: graphState.activeParentPath,
    });
    const children = parent.childLocatedBlocks;
    const bound1 = graphState.selectionRange.start.get(graphState.activeParentPath.size);
    const bound2 = graphState.selectionRange.end.get(graphState.activeParentPath.size);
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
          graphState.activeParentPath.join(PATH_DELIMITER) +
          (graphState.activeParentPath.size > 0 ? PATH_DELIMITER : "") +
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
    if (graphState.isSelectionActive) {
      const clipboardVals = graphState.isSelectionByText
        ? getDeepClipboardVals()
        : getShallowClipboardVals();
      logKeyEvent("copy:\n" + clipboardVals);
      await navigator.clipboard.writeText(clipboardVals);
    }
  };

  const toggleSelectionDepth = () => {
    logAction("toggleSelectionDepth");
    graphDispatch((state: IGraph): IGraph => {
      return state.toggleSelectionType();
    });
  };

  // const toggleSelectionText = graphState.isSelectionByText ? "select text" : "select references";
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

  const loadHandler = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: "JSON",
            accept: {
              "application/*": [".json"],
            },
          },
        ],
        excludeAcceptAllOption: true,
        multiple: false,
      });

      // get file contents
      const fileData = await fileHandle.getFile();
      const stringData = await fileData.text();
      graphDispatch((state: IGraph): IGraph => {
        return graphFromJson(stringData, state);
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
    if (graphState.isSelectionActive && !graphState.isSelectionByText) {
      logKeyEvent("Backspace");
      graphDispatch((state: IGraph): IGraph => {
        const locatedBlocksToRemove = [];
        const activeParentContent = getContentFromPath(state, viewState, {
          focusPath: state.activeParentPath,
        });
        activeParentContent.childLocatedBlocks.forEach((childLocatedId) => {
          if (isChildBetweenSelection(state, childLocatedId)) {
            locatedBlocksToRemove.push(childLocatedId);
          }
        });
        locatedBlocksToRemove.forEach((locatedBlockId) => {
          state = state.removeLocatedBlock(locatedBlockId);
        });
        return state.endSelection();
      });
    }
  };

  const togglePreview = () => {
    setIsPreviewActive(!isPreviewActive);
  };

  return (
    <Wrapper shouldGrow={false}>
      <div className="flex-grow flex">
        <div onCopy={copyHandler} onKeyDown={keyDownHandler} className="flex-1">
          <div className="flex border-b mb-1 select-none">
            <span className="mx-2 text-sm">Options:</span>
            {/* <button
              onClick={toggleSelectionDepth}
              className={buttonClasses(graphState.isSelectionActive)}
            >
              {toggleSelectionText}
            </button> */}
            <button
              onClick={handleBackspace}
              className={buttonClasses(graphState.isSelectionActive)}
            >
              delete references
            </button>
            <button onClick={saveHandler} className={buttonClasses(true)}>
              Save Programs
            </button>
            <button onClick={loadHandler} className={buttonClasses(true)}>
              Load Programs
            </button>
            <button onClick={togglePreview} className={buttonClasses(true)}>
              {isPreviewActive ? "Hide Preview" : "Show Preview"}
            </button>
          </div>
          {viewState.rootRelativePath.size > -1 ? <Breadcrumbs {...breadcrumbProps} /> : null}
          <Block {...rootBlockProps} />
        </div>
        {isPreviewActive ? (
          <div className="flex-1 flex flex-col">
            <Guide {...{ graphState, viewState }} />
          </div>
        ) : null}
      </div>
    </Wrapper>
  );
};
