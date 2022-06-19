import { SELECTION_BASE_URL } from "../../pages/[mode]/[rootContentId]";
import { getURLPaths } from "../../pages/[mode]/[rootContentId]/[paths]";
import { GraphAction } from "../components/GraphProvider";
import { ViewAction } from "../components/ViewProvider";
import { BlockContentId } from "../model/graph/blockContent";
import { IGraph } from "../model/graph/graph";
import { enterPressActionGenerator } from "../model/graph/graphActions";
import { LocatedBlockId } from "../model/graph/locatedBlock";
import { getContentFromPath } from "../model/graphWithView";
import { IVerb } from "../model/verbs/verb";
import { IView } from "../model/view";

export interface IBlockCreationArg {
  humanText?: string;
  verb?: IVerb;
  contentId?: BlockContentId;
}

export const getBlockCreationArg = (
  line: string,
  graphState: IGraph,
  viewState: IView
): IBlockCreationArg => {
  if (line.slice(0, SELECTION_BASE_URL.length) === SELECTION_BASE_URL) {
    try {
      const [rootContentId, paths] = line.slice(SELECTION_BASE_URL.length).split("/");
      const { rootRelativePath, focusPath } = getURLPaths(paths);
      const lineContent = getContentFromPath(graphState, viewState, {
        rootContentId,
        rootRelativePath,
        focusPath,
      });
      return { contentId: lineContent.id };
    } catch (e) {
      return { humanText: line };
    }
  }
  return { humanText: line };
};

export const pasteActionGenerator =
  (
    pasteLocationId: LocatedBlockId,
    clipboardVal: string,
    viewState: IView,
    viewDispatch: React.Dispatch<ViewAction>
  ): GraphAction =>
  (state: IGraph) => {
    const blockCreationArgs: IBlockCreationArg[] = clipboardVal.split("\n").map((line) => {
      return getBlockCreationArg(line, state, viewState);
    });
    console.log(viewState);
    let currentGraphState = state;
    let currentLocatedBlock = currentGraphState.locatedBlocks.get(pasteLocationId);
    let currentBlockContent = currentGraphState.blockContents.get(currentLocatedBlock.contentId);
    let currentFocusPath = viewState.focusPath;
    let currentIsRoot = currentFocusPath.size === 0;
    for (let i = 0; i < blockCreationArgs.length; i++) {
      const blockCreationArg = blockCreationArgs[i];
      if (i > 0) {
        // we create a sibling newline after the first pasted block, as long as there are more blocks to paste
        const newLocatedBlockId = crypto.randomUUID();
        currentFocusPath = currentFocusPath.splice(-1, 1, newLocatedBlockId);
        currentGraphState = currentGraphState.insertNewBlock(
          currentLocatedBlock.id,
          currentLocatedBlock.parentId,
          "",
          currentBlockContent.verb.getDefaultSiblingVerb(),
          newLocatedBlockId
        );

        currentLocatedBlock = currentGraphState.locatedBlocks.get(newLocatedBlockId);
        currentBlockContent = currentGraphState.blockContents.get(currentLocatedBlock.contentId);
        currentIsRoot = false;
      }
      if (blockCreationArg.contentId) {
        if (currentBlockContent.humanText.length > 0) {
          // if we're pasting a reference into a block with text, we instead create a new block
          // using the same logic as an enter press
          const proxyDispatch = (action: ViewAction) => {
            const state = action(viewState);
            currentFocusPath = state.focusPath;
          };
          currentGraphState = enterPressActionGenerator(
            currentLocatedBlock,
            currentBlockContent,
            currentIsRoot,
            currentBlockContent.humanText,
            "",
            currentFocusPath,
            proxyDispatch
          )(currentGraphState);
          currentIsRoot = false;
          currentLocatedBlock = currentGraphState.locatedBlocks.get(currentFocusPath.last());
          currentBlockContent = currentGraphState.blockContents.get(currentLocatedBlock.contentId);
        }
        // then regardless, we link up the new content
        currentGraphState = currentGraphState.linkNewContent(
          currentLocatedBlock.id,
          blockCreationArg.contentId
        );
        currentLocatedBlock = currentGraphState.locatedBlocks.get(currentLocatedBlock.id);
        currentBlockContent = currentGraphState.blockContents.get(currentLocatedBlock.contentId);
      } else {
        // otherwise we just add text to the block
        currentGraphState = currentGraphState.updateBlockText(
          currentBlockContent.id,
          currentBlockContent.humanText + blockCreationArg.humanText
        );
        currentBlockContent = currentGraphState.blockContents.get(currentBlockContent.id);
        if (blockCreationArg.verb) {
          currentGraphState = currentGraphState.updateBlockVerb(
            currentBlockContent.id,
            blockCreationArg.verb
          );
          currentBlockContent = currentGraphState.blockContents.get(currentBlockContent.id);
        }
      }
    }
    viewDispatch((state: IView) => state.setFocus(currentFocusPath, "end"));
    return currentGraphState;
  };
