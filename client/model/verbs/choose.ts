import { Path } from "../graph";
import { ILocatedBlock } from "../locatedBlock";
import { IVerbGetters, VERB, verb } from "./verb";

export const chooseGetters: IVerbGetters = {
  isAdditive: () => false,
  alwaysPresents: () => true,
  getVerbSelectPresentation: () => ({
    text: "❓",
    tooltip: "Choose an option",
    className: "text-green-700 bg-green-100 border-green-200 hover:bg-green-200 hover:border-green-400",
  }),
  getChildBlockHandleClasses: () => "text-green-300 hover:bg-gray-100",
  getDefaultChildBlockHandleText: (orderIndex: number = -1) => {
    return `${orderIndex + 1}.`;
  },
  getDefaultChildVerb: () => verb(VERB.DO),
  getDefaultSiblingVerb: () => verb(VERB.DO),
  getGuideComponent: function (jsxChildren: JSX.Element): JSX.Element {
    throw new Error("Function not implemented.");
  },
  begin: function (children: ILocatedBlock[]): Path {
    throw new Error("Function not implemented.");
  },
  proceed: function (children: ILocatedBlock[], currentChildId: ILocatedBlock): Path {
    throw new Error("Function not implemented.");
  }
};
