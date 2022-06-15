// crockford object for BlockContent

import { List } from "immutable";
import { rightPad } from "../../lib/loggers";
import { createVerb, IVerb, VERB } from "../verbs/verb";
import { LocationList, UserId } from "./graph";
import { LocatedBlockId } from "./locatedBlock";

export type BlockContentId = string;
export type HumanText = string;

export interface IBlockContentPersistentData {
  id: Readonly<BlockContentId>;
  verb: Readonly<IVerb>;
  humanText: Readonly<HumanText>;
  userId: Readonly<UserId>;
  archived: Readonly<boolean>;
}

export interface IBlockContentAuxiliaryData {
  childLocatedBlocks: LocationList;
  locatedBlocks: LocationList;
}

export interface IBlockContentData
  extends IBlockContentPersistentData,
    IBlockContentAuxiliaryData {}

export interface IBlockContentTransitions {
  updateHumanText: (humanText: HumanText) => IBlockContent;
  updateVerb: (verb: IVerb) => IBlockContent;
  addChildAfter: (leftId: LocatedBlockId, newId: LocatedBlockId) => IBlockContent;
  removeChild: (id: LocatedBlockId) => IBlockContent;
  addLocation: (id: LocatedBlockId) => IBlockContent;
  removeLocation: (id: LocatedBlockId) => IBlockContent;
  setArchived: (archived: boolean) => IBlockContent;
}

export interface IBlockContentGetters {
  getRightSiblingIdOf: (ofId: LocatedBlockId) => LocatedBlockId;
  getLeftSiblingIdOf: (ofId: LocatedBlockId) => LocatedBlockId;
  getLeftmostChildId: () => LocatedBlockId;
  getRightmostChildId: () => LocatedBlockId;
  hasChildren: () => boolean;
  hasLocations: () => boolean;
  isChildBetween: (
    childId: LocatedBlockId,
    bound1: LocatedBlockId,
    bound2: LocatedBlockId
  ) => boolean;
  toString: () => string;
}

export interface IBlockContent
  extends IBlockContentData,
    IBlockContentTransitions,
    IBlockContentGetters {}

const shortcuts = {
  "d:": VERB.DO,
  "c:": VERB.CHOOSE,
  "a:": VERB.ANSWER,
  "r:": VERB.READ,
  "e:": VERB.EDIT,
};

export function createBlockContent(blockContentData: Readonly<IBlockContentData>): IBlockContent {
  const transitions: IBlockContentTransitions = {
    updateHumanText: (humanText: HumanText) => {
      if (humanText.length > 2) {
        const prefix = humanText.substring(0, 2);
        const suffix = humanText.substring(2);
        const verbname = shortcuts[prefix.toLowerCase()];
        if (verbname) {
          return createBlockContent({
            ...blockContentData,
            humanText: suffix,
            verb: createVerb(verbname),
          });
        }
      }
      return createBlockContent({
        ...blockContentData,
        humanText,
      });
    },
    updateVerb: (verb: IVerb) => {
      return createBlockContent({ ...blockContentData, verb });
    },
    addChildAfter: (leftId: LocatedBlockId, newId: LocatedBlockId) => {
      const leftIndex = blockContentData.childLocatedBlocks.indexOf(leftId);
      return createBlockContent({
        ...blockContentData,
        childLocatedBlocks: blockContentData.childLocatedBlocks.insert(leftIndex + 1, newId),
      });
    },
    removeChild: (id: LocatedBlockId) => {
      const index = blockContentData.childLocatedBlocks.indexOf(id);
      if (index === -1) {
        throw new Error(`locatedBlock ${id} is not a child of ${blockContentData.id}`);
      }
      const updatedChildLocatedBlocks = blockContentData.childLocatedBlocks.splice(index, 1);
      return createBlockContent({
        ...blockContentData,
        childLocatedBlocks: updatedChildLocatedBlocks,
      });
    },
    addLocation: (id: LocatedBlockId) => {
      const updatedLocatedBlocks = blockContentData.locatedBlocks.push(id);
      return createBlockContent({ ...blockContentData, locatedBlocks: updatedLocatedBlocks });
    },
    removeLocation: (id: LocatedBlockId) => {
      const index = blockContentData.locatedBlocks.indexOf(id);
      if (index === -1) {
        throw new Error("Parent not found");
      }
      const updatedLocatedBlocks = blockContentData.locatedBlocks.splice(index, 1);
      return createBlockContent({ ...blockContentData, locatedBlocks: updatedLocatedBlocks });
    },
    setArchived: (archived: boolean) => {
      return createBlockContent({ ...blockContentData, archived });
    },
  };

  const getters = {
    getRightSiblingIdOf: (ofId: LocatedBlockId) => {
      const leftIndex = blockContentData.childLocatedBlocks.indexOf(ofId);
      if (leftIndex === -1) {
        throw new Error(`locatedBlock ${ofId} is not a child of ${blockContentData.id}`);
      }
      if (leftIndex === blockContentData.childLocatedBlocks.size - 1) {
        return null;
      }
      return blockContentData.childLocatedBlocks.get(leftIndex + 1);
    },
    getLeftSiblingIdOf: (ofId: LocatedBlockId) => {
      const rightIndex = blockContentData.childLocatedBlocks.indexOf(ofId);
      if (rightIndex === -1) {
        throw new Error(`locatedBlock ${ofId} is not a child of ${blockContentData.id}`);
      }
      if (rightIndex === 0) {
        return null;
      }
      return blockContentData.childLocatedBlocks.get(rightIndex - 1);
    },
    getLeftmostChildId: () => {
      if (blockContentData.childLocatedBlocks.size === 0) {
        return null;
      }
      return blockContentData.childLocatedBlocks.first();
    },
    getRightmostChildId: () => {
      if (blockContentData.childLocatedBlocks.size === 0) {
        return null;
      }
      return blockContentData.childLocatedBlocks.last();
    },
    hasChildren: () => {
      return blockContentData.childLocatedBlocks.size > 0;
    },
    hasLocations: () => {
      return blockContentData.locatedBlocks.size > 0;
    },
    isChildBetween: (childId: LocatedBlockId, bound1: LocatedBlockId, bound2: LocatedBlockId) => {
      const childIndex = blockContentData.childLocatedBlocks.indexOf(childId);
      if (childIndex === -1) {
        throw new Error(`locatedBlock ${childId} is not a child of ${blockContentData.id}`);
      }
      const bound1Index = blockContentData.childLocatedBlocks.indexOf(bound1);
      if (bound1Index === -1) {
        throw new Error(`locatedBlock ${bound1} is not a child of ${blockContentData.id}`);
      }
      const bound2Index = blockContentData.childLocatedBlocks.indexOf(bound2);
      if (bound2Index === -1) {
        throw new Error(`locatedBlock ${bound2} is not a child of ${blockContentData.id}`);
      }
      return (
        (childIndex >= bound1Index && childIndex <= bound2Index) ||
        (childIndex <= bound1Index && childIndex >= bound2Index)
      );
    },
    toString: () => {
      const verbString = blockContentData.verb.name;
      return `blockContent(${rightPad(blockContentData.id)}), verb: ${rightPad(
        verbString
      )}, humanText: ${rightPad(
        blockContentData.humanText
      )}\n    locations: ${blockContentData.locatedBlocks.join(
        ", "
      )}\n    children: ${blockContentData.childLocatedBlocks.join(", ")}`;
    },
  };

  return Object.freeze({
    ...blockContentData,
    ...transitions,
    ...getters,
  });
}

export const contentToJson = (blockContent: IBlockContent) => {
  return {
    id: blockContent.id,
    verb: blockContent.verb.name.toString(),
    humanText: blockContent.humanText,
    userId: blockContent.userId,
    archived: blockContent.archived,
  };
};

export const contentFromJson = (json): IBlockContent => {
  let verbType: string;

  // backwards compatibility
  if (json.verb) {
    verbType = json.verb;
  } else if (json.blockType) {
    verbType = json.blockType;
  } else {
    throw new Error("Verb not found");
  }
  if (verbType === "REFERENCE") {
    verbType = "VIEW";
  }
  if (!json.archived) {
    json.archived = false;
  }

  const blockVerb = createVerb(VERB[verbType]);
  return createBlockContent({
    id: json.id,
    verb: blockVerb,
    humanText: json.humanText,
    userId: json.userId,
    childLocatedBlocks: List(),
    locatedBlocks: List(),
    archived: json.archived,
  });
};
