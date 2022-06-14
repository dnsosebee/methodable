import { List } from "immutable";
import { IVerbContextProps, IWorkspaceProps } from "../../components/guide/GuidePage";
import { DoPage } from "../../components/guide/verbs/Do";
import { IFullBlock } from "../graph/fullBlock";
import { IGraph, LocationList } from "../graph/graph";
import { IView } from "../view";
import { IVerbGetters } from "./verb";

export const viewGetters: IVerbGetters = {
  isWorkspace: () => false,
  getVerbSelectPresentation: () => ({
    text: "👀",
    tooltip: "add a view to all descendants of the parent block",
    className:
      "text-purple-700 bg-purple-100 border-purple-200 hover:bg-purple-200 hover:border-purple-400",
  }),
  getChildBlockHandleClasses: () => "text-purple-300 pr-1.5 hover:bg-gray-100",
  getDefaultChildBlockHandleText: (orderIndex: number = -1) => {
    return "•";
  },
  getPage: DoPage,
  getContext: function (props: IVerbContextProps): JSX.Element {
    throw new Error("Function not implemented.");
  },
  getWorkspace: function (props: IWorkspaceProps): JSX.Element {
    throw new Error("Function not implemented.");
  },
  getNextView: function (
    graphState: IGraph,
    children: List<IFullBlock>,
    path: LocationList,
    currentChild: string,
    fallback: IView
  ): IView {
    throw new Error("Function not implemented.");
  },
};
