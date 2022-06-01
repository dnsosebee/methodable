import { IBlockHandlePresentation } from "../../components/editor/BlockHandle";
import { IVerbSelectPresentation } from "../../components/editor/VerbSelect";
import { ILocatedBlock } from "../locatedBlock";
import { Path } from "../graph";
import { chooseGetters } from "./choose";
import { doGetters } from "./do";
import { readGetters } from "./read";
import { viewGetters } from "./view";
import { editGetters } from "./edit";
import { undefinedGetters } from "./undefined";

export enum VERB {
  UNDEFINED = "UNDEFINED", // for non-existent parent verbs
  DO = "DO",
  CHOOSE = "CHOOSE",
  READ = "READ",
  VIEW = "VIEW",
  EDIT = "EDIT",
}

export interface IVerbGetters {
  isAdditive?: () => boolean;
  alwaysPresents?: () => boolean; // deprecated
  getVerbSelectPresentation: () => IVerbSelectPresentation;
  getDefaultChildBlockHandleText: (orderIndex?: number) => string;
  getChildBlockHandleClasses: () => string;
  getDefaultChildVerb?: () => IVerb;
  getDefaultSiblingVerb?: () => IVerb;
  getDefaultParentVerb?: () => IVerb;
  getGuideComponent: (jsxChildren: JSX.Element) => JSX.Element;
  begin: (children: ILocatedBlock[]) => Path | null; // returns a fullPath for the first instruction page from this block, null if the block isn't an instruction.
  proceed: (children: ILocatedBlock[], currentChildId: ILocatedBlock) => Path | null; // returns a fullPath for the next instruction after the child
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

export function verb(name: VERB): IVerb {
  const VERB_ORDER = [VERB.DO, VERB.CHOOSE, VERB.READ, VERB.VIEW, VERB.EDIT];
  const getters = verbGetters(name);

  const getNext = (): IVerb => {
    if (VERB_ORDER.indexOf(name) === -1) {
      throw new Error(`Block type has no successor: ${String(name)}`);
    }
    const nextIndex = (VERB_ORDER.indexOf(name) + 1) % VERB_ORDER.length;
    return verb(VERB_ORDER[nextIndex]);
  };

  const getChildBlockHandlePresentation = (
    childVerb: IVerb,
    orderIndex?: number
  ): IBlockHandlePresentation => {
    return {
      text: childVerb.isAdditive() ? "+" : getters.getDefaultChildBlockHandleText(orderIndex),
      className: getters.getChildBlockHandleClasses(),
    };
  };

  if (!getters.alwaysPresents) {
    getters.alwaysPresents = () => true;
  }

  if (!getters.isAdditive) {
    getters.isAdditive = () => false;
  }

  if (!getters.getDefaultChildVerb) {
    if (getters.isAdditive()) {
      getters.getDefaultChildVerb = () => verb(VERB.DO);
    } else {
      getters.getDefaultChildVerb = () => verb(name);
    }
  }

  if (!getters.getDefaultSiblingVerb) {
    if (getters.isAdditive()) {
      getters.getDefaultChildVerb = () => verb(VERB.DO);
    } else {
      getters.getDefaultSiblingVerb = () => verb(name);
    }
  }

  if (!getters.getDefaultParentVerb) {
    if (getters.isAdditive()) {
      getters.getDefaultParentVerb = () => verb(VERB.DO);
    } else {
      getters.getDefaultParentVerb = () => verb(name);
    }
  }

  return Object.freeze({
    name,
    getNext,
    getChildBlockHandlePresentation,
    ...getters,
  });
}

export interface IVerb extends IVerbGetters {
  name: VERB;
  getNext: () => IVerb;
  getChildBlockHandlePresentation: (
    childVerb: IVerb,
    orderIndex?: number
  ) => IBlockHandlePresentation;
}
