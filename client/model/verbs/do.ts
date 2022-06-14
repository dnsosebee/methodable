import { List } from "immutable";
import { IWorkspaceProps } from "../../components/guide/GuidePage";
import { DoContext, DoPage } from "../../components/guide/verbs/Do";
import { fullBlockFromLocatedBlockId, IFullBlock } from "../graph/fullBlock";
import { IGraph, Path } from "../graph/graph";
import { LocatedBlockId } from "../graph/locatedBlock";
import { IView, MODE } from "../view";
import { IVerbGetters } from "./verb";

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
  getNextView: (
    graphState: IGraph,
    childBlocks: List<IFullBlock>,
    path: Path,
    currentChild: LocatedBlockId,
    fallback: IView
  ) => {
    const childIndex = currentChild
      ? childBlocks.findIndex((child) => child.locatedBlock.id === currentChild)
      : -1;
    for (let i = childIndex + 1; i < childBlocks.size; i++) {
      const child = childBlocks.get(i);
      const childPath = path ? path.push(child.locatedBlock.id) : List([child.locatedBlock.id]);
      if (!child.blockContent.verb.isWorkspace()) {
        fallback = fallback.setFocus(childPath, fallback.focusPosition).setMode(MODE.GUIDE);
        const grandchildren = child.blockContent.childLocatedBlocks.map((childId) =>
          fullBlockFromLocatedBlockId(graphState, childId)
        );

        return child.blockContent.verb.getNextView(
          graphState,
          grandchildren,
          childPath,
          null,
          fallback
        );
      }
    }
    return fallback;
  },
};
