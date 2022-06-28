import { List } from "immutable";
import {
  IVerbContextProps,
  IVerbPageProps,
  IWorkspaceProps,
} from "../../components/guide/GuidePage";
import { IBlockContent } from "../graph/blockContent";
import { IFullBlock } from "../graph/fullBlock";
import { IGraph, Path } from "../graph/graph";
import { LocatedBlockId } from "../graph/locatedBlock";
import { createVerb, IVerbGetters, VERB } from "./verb";

export const commentGetters: IVerbGetters = {
  isWorkspace: () => true,
  getDefaultChildVerb: () => createVerb(VERB.COMMENT),
  getDefaultSiblingVerb: () => createVerb(VERB.COMMENT),
  getVerbSelectPresentation: () => ({
    text: "💬",
    tooltip: "Self and children are hidden from control flow",
    className: "text-gray-700 bg-gray-100 border-gray-200 hover:bg-gray-200 hover:border-gray-400",
  }),
  getChildBlockHandleClasses: () => "text-gray-300 pr-1.5 hover:bg-gray-100",
  getDefaultChildBlockHandleText: (orderIndex: number = -1) => {
    return "•";
  },
  getContext: (props: IVerbContextProps) => null,
  getPage: (props: IVerbPageProps) => null,
  getWorkspace: (props: IWorkspaceProps) => null,
  getContinuationChildId: (
    controlFlowChildBlocks: List<IFullBlock>,
    childLocatedId: LocatedBlockId
  ): LocatedBlockId => null,
  getBeginPath: (graphState: IGraph, content: IBlockContent): Path => List(),
};
