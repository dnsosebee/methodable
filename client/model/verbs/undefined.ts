import { IVerbSelectPresentation } from "../../components/editor/VerbSelect";
import { Path } from "../graph";
import { ILocatedBlock } from "../locatedBlock";
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
  getGuideComponent: function (jsxChildren: JSX.Element): JSX.Element {
    throw new Error("Function not implemented.");
  },
  begin: function (children: ILocatedBlock[]): Path {
    throw new Error("Function not implemented.");
  },
  proceed: function (children: ILocatedBlock[], currentChildId: ILocatedBlock): Path {
    throw new Error("Function not implemented.");
  },
};
