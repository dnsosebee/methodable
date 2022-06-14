import { List } from "immutable";
import { IWorkspaceProps } from "../../components/guide/GuidePage";
import { ChooseContext, ChoosePage } from "../../components/guide/verbs/Choose";
import { fullBlockFromLocatedBlockId, IFullBlock } from "../graph/fullBlock";
import { IGraph, Path } from "../graph/graph";
import { LocatedBlockId } from "../graph/locatedBlock";
import { IView, MODE, resolveView } from "../view";
import { createVerb, IVerbGetters, VERB } from "./verb";

type NewType = Path;

export const chooseGetters: IVerbGetters = {
  isWorkspace: () => false,
  getVerbSelectPresentation: () => ({
    text: "❓",
    tooltip: "Choose an option",
    className:
      "text-green-700 bg-green-100 border-green-200 hover:bg-green-200 hover:border-green-400",
  }),
  getChildBlockHandleClasses: () => "text-green-300 hover:bg-gray-100",
  getDefaultChildBlockHandleText: (orderIndex: number = -1) => {
    return `${orderIndex + 1}.`;
  },
  getDefaultChildVerb: () => createVerb(VERB.DO),
  getDefaultSiblingVerb: () => createVerb(VERB.DO),
  getContext: ChooseContext,
  getPage: ChoosePage,
  getWorkspace: function (props: IWorkspaceProps): JSX.Element {
    throw new Error("Function not implemented.");
  },
  getNextView: (
    graphState: IGraph,
    children: List<IFullBlock>,
    path: Path,
    currentChild: LocatedBlockId,
    fallback: IView
  ) => {
    if (currentChild) {
      const child = fullBlockFromLocatedBlockId(graphState, currentChild);

      return child.blockContent.verb.getNextView(
        graphState,
        child.blockContent.childLocatedBlocks.map((childId) =>
          fullBlockFromLocatedBlockId(graphState, childId)
        ),
        path,
        undefined,
        fallback
      );
    }
    return resolveView(fallback, { focusPath: path ? path : List(), mode: MODE.GUIDE });
  },
};
