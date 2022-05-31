import { ILocatedBlock } from "../locatedBlock";
import { IFullPath, Path } from "../graph";
import { IVerbGetters } from "./verb";

export const doGetters: IVerbGetters = {
  isAdditive: () => false,
  alwaysPresents: () => false,
  getVerbSelectPresentation: () => ({
    text: "🏃",
    tooltip: "Do an instruction",
    className: "text-blue-700 bg-blue-100 border-blue-200 hover:bg-blue-200 hover:border-blue-400",
  }),
  getChildBlockHandleClasses: () => "text-blue-300 hover:bg-gray-100",
  getDefaultChildBlockHandleText: (orderIndex: number = -1) => {
    return `${orderIndex + 1}.`;
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
