import { SELECTION_BASE_URL } from "../../pages/[mode]/[rootContentId]";
import { getURLPaths } from "../../pages/[mode]/[rootContentId]/[paths]";
import { BlockContentId } from "../model/blockContent";
import { LocatedBlockId } from "../model/locatedBlock";
import { GraphAction, IGraph, Path } from "../model/graph";
import { IVerb } from "../model/verbs/verb";
import { enterPressActionGenerator } from "../model/actions";

export interface IBlockCreationArg {
  humanText?: string;
  verb?: IVerb;
  contentId?: BlockContentId;
}

export const getBlockCreationArg = (line: string, graph: IGraph): IBlockCreationArg => {
  if (line.slice(0, SELECTION_BASE_URL.length) === SELECTION_BASE_URL) {
    try {
      const [contentId, paths] = line.slice(SELECTION_BASE_URL.length).split("/");
      const { rootRelativePath, focusPath, isFocusSpecifiedInURL } = getURLPaths(paths);
      const lineContent = graph.getContentFromPath({
        contentId,
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

export const pasteActionGenerator = (
  graph: IGraph,
  pasteLocationId: LocatedBlockId,
  path: Path,
  isRoot: boolean,
  clipboardVal: string
): GraphAction => {
  const blockCreationArgs: IBlockCreationArg[] = clipboardVal.split("\n").map((line) => {
    return getBlockCreationArg(line, graph);
  });
  let currentState = graph;
  let currentLocatedBlock = graph.locatedBlocks.get(pasteLocationId);
  let currentBlockContent = graph.blockContents.get(currentLocatedBlock.contentId);
  let currentFocusPath = path;
  let currentIsRoot = isRoot;
  for (let i = 0; i < blockCreationArgs.length; i++) {
    const blockCreationArg = blockCreationArgs[i];
    if (i > 0) {
      // we create a sibling newline after the first pasted block, as long as there are more blocks to paste
      const newLocatedBlockId = crypto.randomUUID();
      currentFocusPath = [...currentFocusPath.slice(0, -1), newLocatedBlockId];
      currentState = currentState
        .insertNewBlock(
          currentLocatedBlock.id,
          currentLocatedBlock.parentId,
          "",
          currentBlockContent.verb.getDefaultSiblingVerb(),
          newLocatedBlockId
        )
        .setFocusLatch(currentFocusPath, "start");
      currentLocatedBlock = currentState.locatedBlocks.get(newLocatedBlockId);
      currentBlockContent = currentState.blockContents.get(currentLocatedBlock.contentId);
      currentIsRoot = false;
    }
    if (blockCreationArg.contentId) {
      if (currentBlockContent.humanText.length > 0) {
        // if we're pasting a reference into a block with text, we instead create a new block
        // using the same logic as an enter press
        currentState = enterPressActionGenerator(
          currentLocatedBlock,
          currentBlockContent,
          currentIsRoot,
          currentBlockContent.humanText,
          "",
          currentFocusPath
        )(currentState);
        currentIsRoot = false;
        currentFocusPath = currentState.focusPath;
        currentLocatedBlock = currentState.locatedBlocks.get(
          currentFocusPath[currentFocusPath.length - 1]
        );
        currentBlockContent = currentState.blockContents.get(currentLocatedBlock.contentId);
      }
      // then regardless, we link up the new content
      currentState = currentState
        .linkNewContent(currentLocatedBlock.id, blockCreationArg.contentId)
        .setFocusLatch(currentFocusPath, "end");
      currentLocatedBlock = currentState.locatedBlocks.get(currentLocatedBlock.id);
      currentBlockContent = currentState.blockContents.get(currentLocatedBlock.contentId);
    } else {
      // otherwise we just add text to the block
      currentState = currentState
        .updateBlockText(
          currentBlockContent.id,
          currentBlockContent.humanText + blockCreationArg.humanText
        )
        .setFocusLatch(currentFocusPath, "end");
      currentBlockContent = currentState.blockContents.get(currentBlockContent.id);
      if (blockCreationArg.verb) {
        currentState = currentState.updateBlockVerb(currentBlockContent.id, blockCreationArg.verb);
        currentBlockContent = currentState.blockContents.get(currentBlockContent.id);
      }
    }
  }
  return (state: IGraph) => currentState;
};
