import { ILocatedBlock } from "../locatedBlock";
import { IFullPath, Path } from "../graph";
import { IVerbGetters } from "./verb";

export const readGetters: IVerbGetters = {
  isAdditive: () => false,
  alwaysPresents: () => true,
  getVerbSelectPresentation: () => ({
    text: "📖",
    tooltip: "Read a note",
    className:
      "text-orange-700 bg-orange-100 border-orange-200 hover:bg-orange-200 hover:border-orange-400",
  }),
  getChildBlockHandleClasses: () => "text-orange-300 pr-1.5 hover:bg-gray-100",
  getDefaultChildBlockHandleText: (orderIndex: number = -1) => {
    return `•`;
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
