import { List } from "immutable";
import { IBlockHandlePresentation } from "../../components/editor/block/BlockHandle";
import { IVerbSelectPresentation } from "../../components/editor/block/VerbSelect";
import {
  IVerbContextProps,
  IVerbPageProps,
  IWorkspaceProps,
} from "../../components/guide/GuidePage";
import { IFullBlock } from "../graph/fullBlock";
import { IGraph, Path } from "../graph/graph";
import { LocatedBlockId } from "../graph/locatedBlock";
import { IView } from "../view";
import { chooseGetters } from "./choose";
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
  getNextView: (
    graphState: IGraph,
    childBlocks: List<IFullBlock>,
    path: Path,
    currentChild: LocatedBlockId,
    fallback: IView
  ) => IView;
}

const verbGetters = (name: VERB): IVerbGetters => {
  switch (name) {
    case VERB.DO:
      return doGetters;
    case VERB.CHOOSE:
      return chooseGetters;
    case VERB.READ:
      return readGetters;
    case VERB.VIEW:
      return viewGetters;
    case VERB.EDIT:
      return editGetters;
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
}

export function createVerb(name: VERB): IVerb {
  const VERB_ORDER = [VERB.DO, VERB.CHOOSE, VERB.READ, VERB.EDIT]; // removing view for now: it has a bad name and is not super necessary for MVP
  const getters = verbGetters(name);

  const getNext = (): IVerb => {
    if (VERB_ORDER.indexOf(name) === -1) {
      throw new Error(`Block type has no successor: ${String(name)}`);
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
    ...getters,
  });
}
