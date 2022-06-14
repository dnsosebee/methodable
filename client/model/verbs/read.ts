import { List } from "immutable";
import { IWorkspaceProps } from "../../components/guide/GuidePage";
import { ReadContext, ReadPage } from "../../components/guide/verbs/Read";
import { IFullBlock } from "../graph/fullBlock";
import { IGraph, Path } from "../graph/graph";
import { LocatedBlockId } from "../graph/locatedBlock";
import { IView, MODE, resolveView } from "../view";
import { IVerbGetters } from "./verb";

export const readGetters: IVerbGetters = {
  isWorkspace: () => false,
  isTerminal: () => true,
  getVerbSelectPresentation: () => ({
    text: "📖",
    tooltip: "Read a note",
    className:
      "text-orange-700 bg-orange-100 border-orange-200 hover:bg-orange-200 hover:border-orange-400",
  }),
  getChildBlockHandleClasses: () => "text-orange-300 pr-1 hover:bg-gray-100",
  getDefaultChildBlockHandleText: (orderIndex: number = -1) => {
    return `•`;
  },
  getContext: ReadContext,
  getPage: ReadPage,
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
    return resolveView(fallback, { focusPath: path ? path : List(), mode: MODE.GUIDE });
  },
};
