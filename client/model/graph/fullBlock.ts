// crockford object for fullBlock, an auxiliary object that contains both location and content

import { IBlockContent } from "./blockContent";
import { IGraphData } from "./graph";
import { ILocatedBlock, LocatedBlockId } from "./locatedBlock";

export interface IFullBlockData {
  locatedBlock: Readonly<ILocatedBlock>;
  blockContent: Readonly<IBlockContent>;
}

export interface IFullBlockFunctions {}

export interface IFullBlock extends IFullBlockData, IFullBlockFunctions {}

export function fullBlockFromLocatedBlockId(
  graphData: IGraphData,
  locatedBlockId: LocatedBlockId
): IFullBlock {
  const locatedBlock = graphData.locatedBlocks.get(locatedBlockId);
  if (!locatedBlock) {
    throw new Error(
      `Located block ${locatedBlockId} not found. graph data: \n${graphData.toString()}`
    );
  }
  const blockContent = graphData.blockContents.get(locatedBlock.contentId);
  if (!blockContent) {
    throw new Error(`Block content ${locatedBlock.contentId} not found`);
  }
  return createFullBlock({ locatedBlock, blockContent });
}

export function createFullBlock(data: Readonly<IFullBlockData>): IFullBlock {
  return Object.freeze({
    ...data,
  });
}
