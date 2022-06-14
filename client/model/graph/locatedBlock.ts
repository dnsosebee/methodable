// crockford object for LocatedBlock

import { rightPad } from "../../lib/loggers";
import { BlockContentId } from "./blockContent";

export type LocatedBlockId = string;
export type BlockStatus = "not started" | "in progress" | "complete";

export interface ILocatedBlockData {
  id: Readonly<LocatedBlockId>;
  contentId: Readonly<BlockContentId>;
  userId: Readonly<string>;
  blockStatus: Readonly<BlockStatus>;
  parentId: Readonly<BlockContentId>;
  leftId: Readonly<LocatedBlockId>;
  archived: Readonly<boolean>;
}

interface ILocatedBlockTransitions {
  setLeftId: (leftId: LocatedBlockId) => ILocatedBlock;
  setParentId: (parentId: BlockContentId) => ILocatedBlock;
  setContentId: (contentId: BlockContentId) => ILocatedBlock;
  setArchived: (archived: boolean) => ILocatedBlock;
}

interface ILocatedBlockGetters {
  toString: () => string;
}

export interface ILocatedBlock
  extends ILocatedBlockData,
    ILocatedBlockTransitions,
    ILocatedBlockGetters {}

export function createLocatedBlock(data: Readonly<ILocatedBlockData>): ILocatedBlock {
  const transitions: ILocatedBlockTransitions = {
    setLeftId: (leftId: LocatedBlockId) => {
      return createLocatedBlock({ ...data, leftId });
    },
    setParentId: (parentId: BlockContentId) => {
      return createLocatedBlock({ ...data, parentId });
    },
    setContentId: (contentId: BlockContentId) => {
      return createLocatedBlock({ ...data, contentId });
    },
    setArchived: (archived: boolean) => {
      return createLocatedBlock({ ...data, archived });
    },
  };
  const toString = () => {
    return `LocatedBlock(${rightPad(data.id)}) -- contentId: ${rightPad(
      data.contentId
    )}, leftId: ${rightPad(data.leftId)}, parentId: ${rightPad(data.parentId)}, archived: ${
      data.archived
    }`;
  };
  return Object.freeze({
    ...data,
    ...transitions,
    toString,
  });
}

export const locatedBlockToJson = (locatedBlock: ILocatedBlock) => {
  return {
    id: locatedBlock.id,
    contentId: locatedBlock.contentId,
    userId: locatedBlock.userId,
    blockStatus: locatedBlock.blockStatus,
    parentId: locatedBlock.parentId,
    leftId: locatedBlock.leftId,
    archived: locatedBlock.archived,
  };
};

export const locatedBlockFromJson = (json): ILocatedBlock => {
  return createLocatedBlock({
    id: json.id,
    contentId: json.contentId,
    userId: json.userId,
    blockStatus: json.blockStatus,
    parentId: json.parentId,
    leftId: json.leftId,
    archived: json.archived,
  });
};
