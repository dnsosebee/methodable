// crockford object for BlockContent

import { blockType, BLOCK_TYPES, IBlockType } from "./blockType";
import { LocatedBlockId } from "./locatedBlock";
import { UserId } from "./state";

export type BlockContentId = string;
export type HumanText = string;

export interface IBlockContentPersistentData {
  id: BlockContentId;
  blockType: IBlockType;
  humanText: HumanText;
  userId: UserId;
}

export interface IBlockContentAuxiliaryData {
  childLocatedBlocks: LocatedBlockId[];
  locatedBlocks: LocatedBlockId[];
}

export interface IBlockContentData
  extends IBlockContentPersistentData,
    IBlockContentAuxiliaryData {}

export interface IBlockContentTransitions {
  updateHumanText: (humanText: HumanText) => IBlockContent;
  updateBlockType: (blockType: IBlockType) => IBlockContent;
  addChildAfter: (leftId: LocatedBlockId, newId: LocatedBlockId) => IBlockContent;
  removeChild: (id: LocatedBlockId) => IBlockContent;
  addLocation: (id: LocatedBlockId) => IBlockContent;
  removeLocation: (id: LocatedBlockId) => IBlockContent;
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
}

export interface IBlockContent
  extends IBlockContentData,
    IBlockContentTransitions,
    IBlockContentGetters {}

export function blockContent(blockContentData: IBlockContentData): IBlockContent {
  const transitions: IBlockContentTransitions = {
    updateHumanText: (humanText: HumanText) => {
      const newData = { ...blockContentData, humanText };
      return blockContent(newData);
    },
    updateBlockType: (blockType: IBlockType) => {
      return blockContent({ ...blockContentData, blockType });
    },
    addChildAfter: (leftId: LocatedBlockId, newId: LocatedBlockId) => {
      const leftIndex = blockContentData.childLocatedBlocks.indexOf(leftId);
      blockContentData.childLocatedBlocks.splice(leftIndex + 1, 0, newId);
      return blockContent(blockContentData);
    },
    removeChild: (id: LocatedBlockId) => {
      const index = blockContentData.childLocatedBlocks.indexOf(id);
      if (index === -1) {
        throw new Error("Child not found");
      }
      blockContentData.childLocatedBlocks.splice(index, 1);
      return blockContent(blockContentData);
    },
    addLocation: (id: LocatedBlockId) => {
      blockContentData.locatedBlocks.push(id);
      return blockContent(blockContentData);
    },
    removeLocation: (id: LocatedBlockId) => {
      const index = blockContentData.locatedBlocks.indexOf(id);
      if (index === -1) {
        throw new Error("Parent not found");
      }
      blockContentData.locatedBlocks.splice(index, 1);
      return blockContent(blockContentData);
    },
  };

  const getters = {
    getRightSiblingIdOf: (ofId: LocatedBlockId) => {
      const leftIndex = blockContentData.childLocatedBlocks.indexOf(ofId);
      if (leftIndex === -1) {
        throw new Error("Child not found");
      }
      if (leftIndex === blockContentData.childLocatedBlocks.length - 1) {
        return null;
      }
      return blockContentData.childLocatedBlocks[leftIndex + 1];
    },
    getLeftSiblingIdOf: (ofId: LocatedBlockId) => {
      const rightIndex = blockContentData.childLocatedBlocks.indexOf(ofId);
      if (rightIndex === -1) {
        throw new Error("Child not found: " + ofId);
      }
      if (rightIndex === 0) {
        return null;
      }
      return blockContentData.childLocatedBlocks[rightIndex - 1];
    },
    getLeftmostChildId: () => {
      if (blockContentData.childLocatedBlocks.length === 0) {
        return null;
      }
      return blockContentData.childLocatedBlocks[0];
    },
    getRightmostChildId: () => {
      if (blockContentData.childLocatedBlocks.length === 0) {
        return null;
      }
      return blockContentData.childLocatedBlocks[blockContentData.childLocatedBlocks.length - 1];
    },
    hasChildren: () => {
      return blockContentData.childLocatedBlocks.length > 0;
    },
    hasLocations: () => {
      return blockContentData.locatedBlocks.length > 0;
    },
    isChildBetween: (childId: LocatedBlockId, bound1: LocatedBlockId, bound2: LocatedBlockId) => {
      const childIndex = blockContentData.childLocatedBlocks.indexOf(childId);
      if (childIndex === -1) {
        throw new Error("Child not found");
      }
      const bound1Index = blockContentData.childLocatedBlocks.indexOf(bound1);
      if (bound1Index === -1) {
        throw new Error("Bound 1 not found");
      }
      const bound2Index = blockContentData.childLocatedBlocks.indexOf(bound2);
      if (bound2Index === -1) {
        throw new Error("Bound 2 not found");
      }
      return (
        (childIndex >= bound1Index && childIndex <= bound2Index) ||
        (childIndex <= bound1Index && childIndex >= bound2Index)
      );
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
    blockType: blockContent.blockType.name.toString().slice(7, -1),
    humanText: blockContent.humanText,
    userId: blockContent.userId,
  };
};

export const contentFromJson = (json): IBlockContent => {
  const type = blockType(BLOCK_TYPES[json.blockType]);
  return blockContent({
    id: json.id,
    blockType: type,
    humanText: json.humanText,
    userId: json.userId,
    childLocatedBlocks: [],
    locatedBlocks: [],
  });
};
