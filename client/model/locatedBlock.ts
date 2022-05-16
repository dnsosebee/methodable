// crockford object for LocatedBlock

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
    setArchived: (archived: boolean) => ILocatedBlock;
  }
  
  export interface ILocatedBlock extends ILocatedBlockData, ILocatedBlockTransitions {}
  
  export function locatedBlock(data: ILocatedBlockData): ILocatedBlock {
    const transitions: ILocatedBlockTransitions = {
      setLeftId: (leftId: LocatedBlockId) => {
        return locatedBlock({ ...data, leftId });
      },
      setParentId: (parentId: BlockContentId) => {
        return locatedBlock({ ...data, parentId });
      },
      setArchived: (archived: boolean) => {
        return locatedBlock({ ...data, archived });
      },
    };
    return Object.freeze({
      ...data,
      ...transitions,
    });
  }
  