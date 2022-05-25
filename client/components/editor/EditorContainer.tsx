import { useContext } from "react";
import { Action, IState, stateFromJson, stateToJson } from "../../model/state";
import { blockType, OPTIONAL_BLOCK_TYPES } from "../../model/blockType";
import { Context } from "../ContextWrapper";
import { Block, IBlockProps } from "./Block";
import { Breadcrumbs, IBreadcrumbsProps } from "./Breadcrumbs";
import { logAction } from "../../lib/loggers";

export const EditorContainer = () => {
  const { state, dispatch }: { state: IState; dispatch: (action: Action) => IState } =
    useContext(Context);
  const rootContent = state.getContentFromPath();

  const rootBlockProps: IBlockProps = {
    path: [],
    content: rootContent,
    isShallowSelected: false,
    isDeepSelected: false,
    isGlobalSelectionActive: state.isSelectionActive,
    parentBlockType: blockType(OPTIONAL_BLOCK_TYPES.UNDEFINED),
    orderNum: 0,
  };

  // shallow
  const getShallowClipboardVals = (): string => {
    const parent = state.getContentFromPath(state.activeParentPath, true);
    const children = parent.childLocatedBlocks;
    const bound1 = state.selectionRange.start[state.activeParentPath.length];
    const bound2 = state.selectionRange.end[state.activeParentPath.length];
    let result = "";
    for (let i = 0; i < children.length; i++) {
      const childId = children[i];
      if (parent.isChildBetween(childId, bound1, bound2)) {
        result +=
          "localhost:3000/edit/" +
          state.rootContentId +
          "/" +
          state.rootRelativePath.join(",") +
          "." +
          state.activeParentPath.join(",") +
          (state.activeParentPath.length > 0 ? "," : "") +
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
    if (state.isSelectionActive) {
      const clipboardVals = state.isSelectionDeep
        ? getDeepClipboardVals()
        : getShallowClipboardVals();
      console.log(clipboardVals);
      await navigator.clipboard.writeText(clipboardVals);
    }
  };

  const toggleSelectionDepth = () => {
    logAction("toggleSelectionDepth");
    dispatch((state: IState): IState => {
      return state.toggleSelectionType();
    });
  };

  const toggleSelectionText = state.isSelectionDeep ? "select text" : "select references";
  const buttonClasses = (isActive: boolean) =>
    `${
      isActive ? "bg-gray-100 text-black" : "bg-gray-100 text-gray-300"
    } hover:bg-gray-200 select-none mb-2 rounded px-1 py-0.5 w-48 mr-2`;
  const breadcrumbProps: IBreadcrumbsProps = {
    rootContentId: state.rootContentId,
    rootRelativePath: state.rootRelativePath,
  };

  const saveHandler = async () => {
    const stateJson = stateToJson(state);
    try {
      const newHandle = await window.showSaveFilePicker({ suggestedName: "my_programs.json" });
      const writableStream = await newHandle.createWritable();
      await writableStream.write(stateJson);
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
      dispatch((state: IState): IState => {
        return stateFromJson(stringData, state);
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div onCopy={copyHandler}>
      <div id="select-this"></div>
      <div className="">
        <div className="flex border-b mb-1 select-none">
          <span className="mx-2">Options:</span>
          <button onClick={toggleSelectionDepth} className={buttonClasses(state.isSelectionActive)}>
            {toggleSelectionText}
          </button>
          <button onClick={saveHandler} className={buttonClasses(true)}>
            Save All Programs
          </button>
          <button onClick={loadHandler} className={buttonClasses(true)}>
            Load All Programs
          </button>
        </div>
        {state.rootRelativePath.length > 0 ? <Breadcrumbs {...breadcrumbProps} /> : null}
        <Block {...rootBlockProps} />
      </div>
    </div>
  );
};
