import { GraphAction } from "../../components/GraphProvider";
import { ViewAction } from "../../components/ViewProvider";
import { IView } from "../view";
import { HumanText, IBlockContent } from "./blockContent";
import { IGraph, Path } from "./graph";
import { ILocatedBlock } from "./locatedBlock";

export const enterPressActionGenerator =
  (
    locatedBlock: ILocatedBlock,
    content: IBlockContent,
    isRoot: boolean,
    leftText: HumanText,
    rightText: HumanText,
    path: Path,
    viewDispatch: (action: ViewAction) => void
  ): GraphAction =>
  (state: IGraph): IGraph => {
    const newLocatedBlockId = crypto.randomUUID();
    if (leftText.length === 0 && rightText.length > 0) {
      // if enter is pressed at the beginning of the line, we just bump that block down a line, and focus on the new line above
      // oldBlock text stays the same
      if (isRoot) {
        return state;
      }
      const newPath = path.splice(-1, 1, newLocatedBlockId);
      viewDispatch((state: IView): IView => {
        return state.setFocus(newPath, "start");
      });
      return state.insertNewBlock(
        locatedBlock.leftId,
        locatedBlock.parentId,
        "",
        content.verb.getDefaultSiblingVerb(),
        newLocatedBlockId
      );
    } else if (content.childLocatedBlocks.size === 0 && !isRoot) {
      // if the old block has no children and isn't root, we add a sibling after the old block
      const newPath = path.splice(-1, 1, newLocatedBlockId);
      viewDispatch((state: IView): IView => {
        return state.setFocus(newPath, "start");
      });
      return state
        .insertNewBlock(
          locatedBlock.id,
          locatedBlock.parentId,
          rightText,
          content.verb.getDefaultSiblingVerb(),
          newLocatedBlockId
        )
        .updateBlockText(content.id, leftText);
    } else {
      // if the old block does have children or is root, we add a child to the old block
      const newPath = path.push(newLocatedBlockId);
      viewDispatch((state: IView): IView => {
        return state.setFocus(newPath, "start");
      });
      return state
        .insertNewBlock(
          null,
          content.id,
          rightText,
          content.verb.getDefaultChildVerb(),
          newLocatedBlockId
        )
        .updateBlockText(content.id, leftText);
    }
  };
