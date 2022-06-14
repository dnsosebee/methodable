import { List } from "immutable";
import { IVerbPageProps } from "../../components/guide/GuidePage";
import { EditContext, EditWorkspace } from "../../components/guide/verbs/Edit";
import { IBlockContent } from "../graph/blockContent";
import { IFullBlock } from "../graph/fullBlock";
import { IGraph, Path } from "../graph/graph";
import { LocatedBlockId } from "../graph/locatedBlock";
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
  getContinuationChildId: (
    controlFlowChildBlocks: List<IFullBlock>,
    childLocatedId: LocatedBlockId
  ): LocatedBlockId => null,
  getBeginPath: (graphState: IGraph, content: IBlockContent): Path => List(),
};
