import { HumanText, IBlockContent } from "./blockContent";
import { GraphAction, IGraph, Path } from "./graph";
import { ILocatedBlock } from "./locatedBlock";

export const enterPressActionGenerator =
  (
    locatedBlock: ILocatedBlock,
    content: IBlockContent,
    isRoot: boolean,
    leftText: HumanText,
    rightText: HumanText,
    path: Path
  ): GraphAction =>
  (state: IGraph): IGraph => {
    const newLocatedBlockId = crypto.randomUUID();
    if (leftText.length === 0 && rightText.length > 0) {
      // if enter is pressed at the beginning of the line, we just bump that block down a line, and focus on the new line above
      // oldBlock text stays the same
      if (isRoot) {
        return state;
      }
      const newPath = [...path.slice(0, -1), newLocatedBlockId];
      return state
        .insertNewBlock(
          locatedBlock.leftId,
          locatedBlock.parentId,
          "",
          content.verb.getDefaultSiblingVerb(),
          newLocatedBlockId
        )
        .setFocusLatch(newPath, "start");
    } else if (content.childLocatedBlocks.length === 0 && !isRoot) {
      // if the old block has no children and isn't root, we add a sibling after the old block
      const newPath = [...path.slice(0, -1), newLocatedBlockId];
      return state
        .insertNewBlock(
          locatedBlock.id,
          locatedBlock.parentId,
          rightText,
          content.verb.getDefaultSiblingVerb(),
          newLocatedBlockId
        )
        .updateBlockText(content.id, leftText)
        .setFocusLatch(newPath, "start");
    } else {
      // if the old block does have children or is root, we add a child to the old block
      const newPath = [...path, newLocatedBlockId];
      return state
        .insertNewBlock(
          null,
          content.id,
          rightText,
          content.verb.getDefaultChildVerb(),
          newLocatedBlockId
        )
        .updateBlockText(content.id, leftText)
        .setFocusLatch(newPath, "start");
    }
  };
