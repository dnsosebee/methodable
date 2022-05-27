import { ILocatedBlock } from "../locatedBlock";
import { IFullPath, Path } from "../graph";
import { IVerbGetters } from "./verb";

export const editGetters: IVerbGetters = {
  isAdditive: () => false,
  alwaysPresents: () => false,
  getVerbSelectPresentation: () => ({
    text: "✏️",
    tooltip: "Add an editor to all descendants of the parent block",
    className: "text-red-700 bg-red-100 border-red-200 hover:bg-red-200 hover:border-red-400",
  }),
  getChildBlockHandleClasses: () => "text-red-300 pr-1.5 hover:bg-gray-100",
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
