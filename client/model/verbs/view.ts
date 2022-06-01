import { ILocatedBlock } from "../locatedBlock";
import { Path } from "../graph";
import { IVerbGetters } from "./verb";

export const viewGetters: IVerbGetters = {
  isAdditive: () => false,
  alwaysPresents: () => false,
  getVerbSelectPresentation: () => ({
    text: "👀", // or, maybe use   ”
    tooltip: "add a view to all descendants of the parent block",
    className:
      "text-purple-700 bg-purple-100 border-purple-200 hover:bg-purple-200 hover:border-purple-400",
  }),
  getChildBlockHandleClasses: () => "text-purple-300 pr-1.5 hover:bg-gray-100",
  getDefaultChildBlockHandleText: (orderIndex: number = -1) => {
    return "•";
  },
  getGuideComponent: function (jsxChildren: JSX.Element): JSX.Element {
    throw new Error("Function not implemented.");
  },
  begin: function (children: ILocatedBlock[]): Path | null {
    // for (const child of children) {
    return null;
  },
  proceed: function (children: ILocatedBlock[], currentChildId: ILocatedBlock): Path | null {
    throw new Error("Function not implemented.");
  },
};
