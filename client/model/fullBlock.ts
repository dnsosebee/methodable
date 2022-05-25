// crockford object for fullBlock, an auxiliary object that contains both location and content

import { IBlockContent } from "./blockContent";
import { ILocatedBlock, LocatedBlockId } from "./locatedBlock";
import { IGraphData } from "./graph";

export interface IFullBlockData {
  locatedBlock: ILocatedBlock;
  blockContent: IBlockContent;
}

export interface IFullBlockFunctions {}

export interface IFullBlock extends IFullBlockData, IFullBlockFunctions {}

export function fullBlockFromLocatedBlockId(
  stateData: IGraphData,
  locatedBlockId: LocatedBlockId
): IFullBlock {
  const locatedBlock = stateData.locatedBlocks.get(locatedBlockId);
  const blockContent = stateData.blockContents.get(locatedBlock.contentId);
  return fullBlock(stateData, { locatedBlock, blockContent });
}

export function fullBlock(stateData: IGraphData, data: IFullBlockData): IFullBlock {
  return Object.freeze({
    ...data,
  });
}
