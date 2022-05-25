// crockford object for LocatedBlock

import { rightPad } from "../lib/loggers";
import { BlockContentId } from "./blockContent";

export type LocatedBlockId = string;
export type BlockStatus = "not started" | "in progress" | "complete";

export interface ILocatedBlockData {
  id: LocatedBlockId;
  contentId: BlockContentId;
  userId: string;
  blockStatus: BlockStatus;
  parentId: BlockContentId;
  leftId: LocatedBlockId;
  archived: boolean;
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

export function locatedBlock(data: ILocatedBlockData): ILocatedBlock {
  const transitions: ILocatedBlockTransitions = {
    setLeftId: (leftId: LocatedBlockId) => {
      return locatedBlock({ ...data, leftId });
    },
    setParentId: (parentId: BlockContentId) => {
      return locatedBlock({ ...data, parentId });
    },
    setContentId: (contentId: BlockContentId) => {
      return locatedBlock({ ...data, contentId });
    },
    setArchived: (archived: boolean) => {
      return locatedBlock({ ...data, archived });
    },
  };
  const toString = () => {
    return `LocatedBlock(${rightPad(data.id)}) -- contentId: ${rightPad(
      data.contentId
    )}, leftId: ${rightPad(data.leftId)}, parentId: ${rightPad(data.parentId)}, archived: ${data.archived}`;
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
  return locatedBlock({
    id: json.id,
    contentId: json.contentId,
    userId: json.userId,
    blockStatus: json.blockStatus,
    parentId: json.parentId,
    leftId: json.leftId,
    archived: json.archived,
  });
};
