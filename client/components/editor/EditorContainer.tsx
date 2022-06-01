import { List } from "immutable";
import { useContext } from "react";
import {
  PATH_DELIMITER,
  PATH_SEPARATOR,
  SELECTION_BASE_URL,
} from "../../../pages/[mode]/[rootContentId]";
import { logAction, logKeyEvent } from "../../lib/loggers";
import { graphFromJson, graphToJson, IGraph } from "../../model/graph";
import { getContentFromPath } from "../../model/graphWithPaths";
import { VERB, verb } from "../../model/verbs/verb";
import { useFullPath } from "../FullPathProvider";
import { graphContext, useGraph } from "../GraphProvider";
import { Wrapper } from "../Wrapper";
import { Block, IBlockProps } from "./Block";
import { Breadcrumbs, IBreadcrumbsProps } from "./Breadcrumbs";

export const EditorContainer = () => {
  const { graphState, graphDispatch } = useContext(graphContext);
  const { fullPathState } = useFullPath();

  const rootContent = getContentFromPath(graphState, fullPathState, {});

  const rootBlockProps: IBlockProps = {
    path: List(),
    content: rootContent,
    isShallowSelected: false,
    isDeepSelected: false,
    isGlobalSelectionActive: graphState.isSelectionActive,
    parentVerb: verb(VERB.UNDEFINED),
    orderIndex: 0,
  };

  // shallow
  const getShallowClipboardVals = (): string => {
    const parent = getContentFromPath(graphState, fullPathState, {
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
          fullPathState.rootContentId +
          "/" +
          fullPathState.rootRelativePath.join(PATH_DELIMITER) +
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
      const clipboardVals = graphState.isSelectionDeep
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

  const toggleSelectionText = graphState.isSelectionDeep ? "select text" : "select references";
  const buttonClasses = (isActive: boolean) =>
    `${
      isActive ? "bg-gray-100 text-black" : "bg-gray-100 text-gray-300"
    } hover:bg-gray-200 select-none mb-2 rounded px-1 py-0.5 w-48 mr-2`;
  const breadcrumbProps: IBreadcrumbsProps = {
    rootContentId: fullPathState.rootContentId,
    rootRelativePath: fullPathState.rootRelativePath,
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

  return (
    <Wrapper shouldGrow={false}>
      <div onCopy={copyHandler}>
        <div className="">
          <div className="flex border-b mb-1 select-none">
            <span className="mx-2">Options:</span>
            <button
              onClick={toggleSelectionDepth}
              className={buttonClasses(graphState.isSelectionActive)}
            >
              {toggleSelectionText}
            </button>
            <button onClick={saveHandler} className={buttonClasses(true)}>
              Save All Programs
            </button>
            <button onClick={loadHandler} className={buttonClasses(true)}>
              Load All Programs
            </button>
          </div>
          {fullPathState.rootRelativePath.size > -1 ? <Breadcrumbs {...breadcrumbProps} /> : null}
          <Block {...rootBlockProps} />
        </div>
      </div>
    </Wrapper>
  );
};
