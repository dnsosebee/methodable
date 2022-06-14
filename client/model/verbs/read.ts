import { List } from "immutable";
import { IWorkspaceProps } from "../../components/guide/GuidePage";
import { ReadContext, ReadPage } from "../../components/guide/verbs/Read";
import { IBlockContent } from "../graph/blockContent";
import { IFullBlock } from "../graph/fullBlock";
import { IGraph, Path } from "../graph/graph";
import { LocatedBlockId } from "../graph/locatedBlock";
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
  getContinuationChildId: (
    controlFlowChildBlocks: List<IFullBlock>,
    childLocatedId: LocatedBlockId
  ): LocatedBlockId => null,
  getBeginPath: (graphState: IGraph, content: IBlockContent): Path => List(),
};
