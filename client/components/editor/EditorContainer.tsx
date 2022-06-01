import {
  PATH_DELIMITER,
  PATH_SEPARATOR,
  SELECTION_BASE_URL
} from "../../../pages/[mode]/[rootContentId]";
import { logAction } from "../../lib/loggers";
import { graphFromJson, graphToJson, IGraph } from "../../model/graph";
import { useGraphWithPaths } from "../../model/graphWithPaths";
import { VERB, verb } from "../../model/verbs/verb";
import { Wrapper } from "../Wrapper";
import { Block, IBlockProps } from "./Block";
import { Breadcrumbs, IBreadcrumbsProps } from "./Breadcrumbs";

export const EditorContainer = () => {
  const { graphState, fullPathState, graphDispatch, getContentFromPath } = useGraphWithPaths();
  const rootContent = getContentFromPath({});

  const rootBlockProps: IBlockProps = {
    path: [],
    content: rootContent,
    isShallowSelected: false,
    isDeepSelected: false,
    isGlobalSelectionActive: graphState.isSelectionActive,
    parentVerb: verb(VERB.UNDEFINED),
    orderIndex: 0,
  };

  // shallow
  const getShallowClipboardVals = (): string => {
    const parent = getContentFromPath({ focusPath: graphState.activeParentPath });
    const children = parent.childLocatedBlocks;
    const bound1 = graphState.selectionRange.start[graphState.activeParentPath.length];
    const bound2 = graphState.selectionRange.end[graphState.activeParentPath.length];
    let result = "";
    for (let i = 0; i < children.length; i++) {
      const childId = children[i];
      if (parent.isChildBetween(childId, bound1, bound2)) {
        result +=
          SELECTION_BASE_URL +
          fullPathState.rootContentId +
          "/" +
          fullPathState.rootRelativePath.join(PATH_DELIMITER) +
          PATH_SEPARATOR +
          graphState.activeParentPath.join(PATH_DELIMITER) +
          (graphState.activeParentPath.length > 0 ? PATH_DELIMITER : "") +
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
    console.log("copy");
    if (graphState.isSelectionActive) {
      const clipboardVals = graphState.isSelectionDeep
        ? getDeepClipboardVals()
        : getShallowClipboardVals();
      console.log(clipboardVals);
      await navigator.clipboard.writeText(clipboardVals);
    }
  };

  const toggleSelectionDepth = () => {
    logAction("toggleSelectionDepth");
    graphDispatch((graphState: IGraph): IGraph => {
      return graphState.toggleSelectionType();
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
      graphDispatch((graph: IGraph): IGraph => {
        return graphFromJson(stringData, graphState);
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
          {fullPathState.rootRelativePath.length > -1 ? <Breadcrumbs {...breadcrumbProps} /> : null}
          <Block {...rootBlockProps} />
        </div>
      </div>
    </Wrapper>
  );
};
