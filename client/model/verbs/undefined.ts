import { List } from "immutable";
import { IVerbSelectPresentation } from "../../components/editor/block/VerbSelect";
import {
  IVerbContextProps,
  IVerbPageProps,
  IWorkspaceProps,
} from "../../components/guide/GuidePage";
import { IBlockContent } from "../graph/blockContent";
import { IFullBlock } from "../graph/fullBlock";
import { IGraph, Path } from "../graph/graph";
import { LocatedBlockId } from "../graph/locatedBlock";
import { IVerbGetters } from "./verb";

export const undefinedGetters: IVerbGetters = {
  getVerbSelectPresentation: function (): IVerbSelectPresentation {
    throw new Error("Function not implemented.");
  },
  getDefaultChildBlockHandleText: function (orderIndex?: number): string {
    throw new Error("Function not implemented.");
  },
  getChildBlockHandleClasses: function (): string {
    throw new Error("Function not implemented.");
  },
  getPage: function (props: IVerbPageProps): JSX.Element {
    throw new Error("Function not implemented.");
  },
  getContext: function (props: IVerbContextProps): JSX.Element {
    throw new Error("Function not implemented.");
  },
  getWorkspace: function (props: IWorkspaceProps): JSX.Element {
    throw new Error("Function not implemented.");
  },
  getContinuationChildId: (
    controlFlowChildBlocks: List<IFullBlock>,
    childLocatedId: LocatedBlockId
  ): LocatedBlockId => null,
  getBeginPath: (graphState: IGraph, content: IBlockContent): Path => List(),
};
