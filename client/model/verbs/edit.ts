import { List } from "immutable";
import { IVerbPageProps } from "../../components/guide/GuidePage";
import { EditContext, EditWorkspace } from "../../components/guide/verbs/Edit";
import { IFullBlock } from "../graph/fullBlock";
import { IGraph, LocationList } from "../graph/graph";
import { IView } from "../view";
import { createVerb, IVerbGetters, VERB } from "./verb";

export const editGetters: IVerbGetters = {
  isWorkspace: () => true,
  getDefaultChildVerb: () => createVerb(VERB.DO),
  getDefaultSiblingVerb: () => createVerb(VERB.DO),
  getVerbSelectPresentation: () => ({
    text: "✏️",
    tooltip: "Add an editor to all descendants of the parent block",
    className: "text-red-700 bg-red-100 border-red-200 hover:bg-red-200 hover:border-red-400",
  }),
  getChildBlockHandleClasses: () => "text-red-300 pr-1.5 hover:bg-gray-100",
  getDefaultChildBlockHandleText: (orderIndex: number = -1) => {
    return "•";
  },
  getContext: EditContext,
  getPage: function (props: IVerbPageProps): JSX.Element {
    return EditWorkspace({ path: props.path });
  },
  getWorkspace: EditWorkspace,
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
