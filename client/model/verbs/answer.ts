import { IWorkspaceProps } from "../../components/guide/GuidePage";
import { AnswerContext, AnswerPage } from "../../components/guide/verbs/Answer";
import { Path } from "../graph/graph";
import { compositionalGetBeginPath, compositionalGetContinuationChildId } from "./do";
import { createVerb, IVerbGetters, VERB } from "./verb";

type NewType = Path;

export const answerGetters: IVerbGetters = {
  isWorkspace: () => false,
  getVerbSelectPresentation: () => ({
    text: "↘️",
    tooltip: "Answer",
    className:
      "text-purple-700 bg-purple-100 border-purple-200 hover:bg-purple-200 hover:border-purple-400",
  }),
  getChildBlockHandleClasses: () => "text-purple-300 hover:bg-gray-100",
  getDefaultChildBlockHandleText: (orderIndex: number = -1) => {
    return `${orderIndex + 1}.`;
  },
  getDefaultChildVerb: () => createVerb(VERB.DO),
  getDefaultSiblingVerb: () => createVerb(VERB.ANSWER),
  getContext: AnswerContext,
  getPage: AnswerPage,
  getWorkspace: function (props: IWorkspaceProps): JSX.Element {
    throw new Error("Function not implemented.");
  },
  getContinuationChildId: compositionalGetContinuationChildId,
  getBeginPath: compositionalGetBeginPath,
};
