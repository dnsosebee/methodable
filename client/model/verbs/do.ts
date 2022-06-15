import { List } from "immutable";
import { getChildLists, IWorkspaceProps } from "../../components/guide/GuidePage";
import { DoContext, DoPage } from "../../components/guide/verbs/Do";
import { IBlockContent } from "../graph/blockContent";
import { IFullBlock } from "../graph/fullBlock";
import { IGraph, Path } from "../graph/graph";
import { LocatedBlockId } from "../graph/locatedBlock";
import { IVerbGetters } from "./verb";

export const compositionalGetContinuationChildId = (
  controlFlowChildBlocks: List<IFullBlock>,
  childLocatedId: LocatedBlockId
): LocatedBlockId => {
  const childIndex = controlFlowChildBlocks.findIndex(
    (child) => child.locatedBlock.id === childLocatedId
  );
  if (childLocatedId === controlFlowChildBlocks.last().locatedBlock.id) {
    return null;
  }
  const nextChild = controlFlowChildBlocks.get(childIndex + 1);
  return nextChild.locatedBlock.id;
};

export const compositionalGetBeginPath = (graphState: IGraph, content: IBlockContent): Path => {
  const { controlFlowChildBlocks } = getChildLists(content, graphState);
  if (controlFlowChildBlocks.isEmpty()) {
    return List();
  }
  const firstControlFlowChild = controlFlowChildBlocks.first();
  return List([firstControlFlowChild.locatedBlock.id]).concat(
    firstControlFlowChild.blockContent.verb.getBeginPath(
      graphState,
      firstControlFlowChild.blockContent
    )
  );
};

export const doGetters: IVerbGetters = {
  isWorkspace: () => false,
  getVerbSelectPresentation: () => ({
    text: "🏃",
    tooltip: "Do an instruction",
    className: "text-blue-700 bg-blue-100 border-blue-200 hover:bg-blue-200 hover:border-blue-400",
  }),
  getChildBlockHandleClasses: () => "text-blue-300 hover:bg-gray-100",
  getDefaultChildBlockHandleText: (orderIndex: number = -1) => {
    return `${orderIndex + 1}.`;
  },
  getContext: DoContext,
  getPage: DoPage,
  getWorkspace: function (props: IWorkspaceProps): JSX.Element {
    throw new Error("Function not implemented.");
  },
  getContinuationChildId: compositionalGetContinuationChildId,
  getBeginPath: compositionalGetBeginPath,
};
