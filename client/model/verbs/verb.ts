import { List } from "immutable";
import { IBlockHandlePresentation } from "../../components/editor/block/BlockHandle";
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
import { answerGetters } from "./answer";
import { chooseGetters } from "./choose";
import { commentGetters } from "./comment";
import { doGetters } from "./do";
import { editGetters } from "./edit";
import { readGetters } from "./read";
import { undefinedGetters } from "./undefined";
import { viewGetters } from "./view";

export enum VERB {
  UNDEFINED = "UNDEFINED", // for non-existent parent verbs
  DO = "DO",
  CHOOSE = "CHOOSE",
  READ = "READ",
  VIEW = "VIEW",
  EDIT = "EDIT",
  ANSWER = "ANSWER",
  COMMENT = "COMMENT",
}

export interface IVerbGetters {
  isWorkspace?: () => boolean;
  isTerminal?: () => boolean;
  getVerbSelectPresentation: () => IVerbSelectPresentation;
  getDefaultChildBlockHandleText: (orderIndex?: number) => string;
  getChildBlockHandleClasses: () => string;
  getDefaultChildVerb?: () => IVerb;
  getDefaultSiblingVerb?: () => IVerb;
  getDefaultParentVerb?: () => IVerb;
  getContext: (props: IVerbContextProps) => JSX.Element; // this one's not optional, the next two are (cause you gotta choose one)
  getPage: (props: IVerbPageProps) => JSX.Element;
  getWorkspace: (props: IWorkspaceProps) => JSX.Element;
  getContinuationChildId: (
    controlFlowChildBlocks: List<IFullBlock>,
    childLocatedId: LocatedBlockId
  ) => LocatedBlockId;
  getBeginPath: (graphState: IGraph, content: IBlockContent) => Path;
}

const verbGetters = (name: VERB): IVerbGetters => {
  switch (name) {
    case VERB.DO:
      return doGetters;
    case VERB.CHOOSE:
      return chooseGetters;
    case VERB.ANSWER:
      return answerGetters;
    case VERB.READ:
      return readGetters;
    case VERB.VIEW:
      return viewGetters;
    case VERB.EDIT:
      return editGetters;
    case VERB.COMMENT:
      return commentGetters;
    case VERB.UNDEFINED:
      return undefinedGetters;
    default:
      throw new Error("Unknown verb: " + name);
  }
};

export interface IVerb extends IVerbGetters {
  name: VERB;
  getNext: () => IVerb;
  getChildBlockHandlePresentation: (
    childVerb: IVerb,
    orderIndex?: number
  ) => IBlockHandlePresentation;
  getChildContinuationPath: (
    graphState: IGraph,
    path: Path,
    controlFlowChildBlocks: List<IFullBlock>,
    childLocatedId: LocatedBlockId,
    oldContinuationPath: Path
  ) => Path;
}

export function createVerb(name: VERB): IVerb {
  const VERB_ORDER = [VERB.DO, VERB.CHOOSE, VERB.ANSWER, VERB.READ, VERB.EDIT]; // removing view for now: it has a bad name and is not super necessary for MVP
  const getters = verbGetters(name);

  const getNext = (): IVerb => {
    if (VERB_ORDER.indexOf(name) === -1) {
      return createVerb(VERB.DO);
    }
    const nextIndex = (VERB_ORDER.indexOf(name) + 1) % VERB_ORDER.length;
    return createVerb(VERB_ORDER[nextIndex]);
  };

  const getChildBlockHandlePresentation = (
    childVerb: IVerb,
    orderIndex?: number
  ): IBlockHandlePresentation => {
    return {
      text: childVerb.isWorkspace() ? "+" : getters.getDefaultChildBlockHandleText(orderIndex),
      className: getters.getChildBlockHandleClasses(),
    };
  };

  const getChildContinuationPath = (
    graphState: IGraph,
    path: Path,
    controlFlowChildBlocks: List<IFullBlock>,
    childLocatedId: LocatedBlockId,
    oldContinuationPath: Path
  ): Path => {
    const continuationChildId = getters.getContinuationChildId(
      controlFlowChildBlocks,
      childLocatedId
    );
    if (continuationChildId) {
      const continuationBlock = controlFlowChildBlocks.find(
        (block) => block.locatedBlock.id === continuationChildId
      );
      const beginPath = continuationBlock.blockContent.verb.getBeginPath(
        graphState,
        continuationBlock.blockContent
      );
      const childContinuationPath = path.push(continuationChildId).concat(beginPath);
      return childContinuationPath;
    }
    return oldContinuationPath;
  };

  if (!getters.isWorkspace) {
    getters.isWorkspace = () => false;
  }

  if (!getters.isTerminal) {
    getters.isTerminal = () => false;
  }

  if (!getters.getDefaultChildVerb) {
    if (getters.isWorkspace()) {
      getters.getDefaultChildVerb = () => createVerb(VERB.DO);
    } else {
      getters.getDefaultChildVerb = () => createVerb(name);
    }
  }

  if (!getters.getDefaultSiblingVerb) {
    if (getters.isWorkspace()) {
      getters.getDefaultChildVerb = () => createVerb(VERB.DO);
    } else {
      getters.getDefaultSiblingVerb = () => createVerb(name);
    }
  }

  if (!getters.getDefaultParentVerb) {
    if (getters.isWorkspace()) {
      getters.getDefaultParentVerb = () => createVerb(VERB.DO);
    } else {
      getters.getDefaultParentVerb = () => createVerb(name);
    }
  }

  return Object.freeze({
    name,
    getNext,
    getChildBlockHandlePresentation,
    getChildContinuationPath,
    ...getters,
  });
}
