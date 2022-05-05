import { HIndexNotFoundError } from "../../lib/errors";
import { BlockId, HierarchyIndex, IBlock, IState } from "./stateTypes";

const DEFAULT_AT = -1;

// always update rootBlock along with the id path
export const updateIdPathHelper = (state: IState, idPath: BlockId[]): IState => {
  state.idPath = idPath;
  state.rootBlockId = idPath[idPath.length - 1];
  return state;
}

export const addParentChildRelationship = (
  parent: IBlock,
  child: IBlock,
  at: number = DEFAULT_AT
) => {
  if (at === DEFAULT_AT) {
    at = parent.children.length;
  }
  parent.children.splice(at, 0, child.id);
  child.parents.push(parent.id);
};

export const removeParentChildRelationship = (
  parent: IBlock,
  child: IBlock,
  at: number = DEFAULT_AT
) => {
  if (at === DEFAULT_AT) {
    at = parent.children.indexOf(child.id);
  }
  parent.children.splice(at, 1);
  const index = child.parents.indexOf(parent.id);
  child.parents.splice(index, 1);
};

// deals with edge case where selection is started at root
export const nonRootHIndex = (hIndex: HierarchyIndex): HierarchyIndex => {
  if (hIndex.length === 0) {
    return [0];
  }
  return hIndex;
};

export const getBlockIdByHIndex = (
  blocksMap: Map<BlockId, IBlock>,
  rootBlockId: BlockId,
  hIndex: HierarchyIndex
): BlockId => {
  let blockId = rootBlockId;
  for (let i = 0; i < hIndex.length; i++) {
    blockId = blocksMap.get(blockId).children[hIndex[i]];
  }
  return blockId;
};

// Sets the id and hIndex of the selection's active parent in the state
export const setActiveParentInfo = (state: IState) => {
  const { blocksMap, rootBlockId, selectionRange } = state;
  let parent: IBlock = blocksMap.get(rootBlockId);
  let activeParentHIndex: HierarchyIndex = [];
  const maxParentDepth = Math.min(selectionRange.start.length - 1, selectionRange.end.length - 1);
  for (let i = 0; i < maxParentDepth; i++) {
    if (selectionRange.start[i] === selectionRange.end[i]) {
      parent = blocksMap.get(parent.children[selectionRange.start[i]]);
      activeParentHIndex.push(selectionRange.start[i]);
    }
  }
  state.activeParentId = parent.id;
  state.activeParentIndex = activeParentHIndex;
};

// returns an array of ancestors of type `BlockId` between the root block (indicated by `rootBlockId`) and the block at `hIndex`
export const getAncestorIds = (
  blocksMap: Map<BlockId, IBlock>,
  rootBlockId: BlockId,
  hIndex: HierarchyIndex
): BlockId[] => {
  let ancestorIds: BlockId[] = [rootBlockId];
  let blockId = rootBlockId;
  for (let i = 0; i < hIndex.length; i++) {
    blockId = blocksMap.get(blockId).children[hIndex[i]];
    ancestorIds.push(blockId);
  }
  return ancestorIds;
};

export const getDownstairsNeighborHIndex = (
  blocksMap: Map<string, IBlock>,
  rootBlockId: string,
  hIndex: HierarchyIndex
): HierarchyIndex => {
  const ancestorIds = getAncestorIds(blocksMap, rootBlockId, hIndex);
  const newHIndex = [...hIndex, -1];
  for (let i = ancestorIds.length - 1; i >= 0; i--) {
    const ancestor = blocksMap.get(ancestorIds[i]);
    if (ancestor.children.length > newHIndex[i] + 1) {
      return [...newHIndex.slice(0, i), newHIndex[i] + 1];
    }
  }
  throw new HIndexNotFoundError();
};

export const getYoungestDescendantHIndex = (
  blocksMap: Map<string, IBlock>,
  rootBlockId: string,
  hIndex: HierarchyIndex
): HierarchyIndex => {
  let newHIndex = [...hIndex];
  let block = blocksMap.get(getBlockIdByHIndex(blocksMap, rootBlockId, hIndex));
  while (block.children.length > 0) {
    const lastChildIndex = block.children.length - 1;
    newHIndex.push(lastChildIndex);
    block = blocksMap.get(block.children[lastChildIndex]);
  }
  return newHIndex;
};

export const getUpstairsNeighborHIndex = (
  blocksMap: Map<string, IBlock>,
  rootBlockId: string,
  hIndex: HierarchyIndex
): HierarchyIndex => {
  if (hIndex.length === 0) {
    throw new HIndexNotFoundError();
  }
  if (hIndex[hIndex.length - 1] === 0) {
    return [...hIndex.slice(0, hIndex.length - 1)];
  }
  const youngerSiblingIndex = hIndex[hIndex.length - 1] - 1;
  const youngerSiblingHIndex = [...hIndex.slice(0, hIndex.length - 1), youngerSiblingIndex];
  return getYoungestDescendantHIndex(blocksMap, rootBlockId, youngerSiblingHIndex);
};

// we move children starting at fromIndex onward
export const moveChildren = (blocksMap: Map<BlockId, IBlock>, from: IBlock, to: IBlock, fromIndex: number = 0) => {
  while (from.children.length > fromIndex) {
    const blockToMove = blocksMap.get(from.children[fromIndex]);
    removeParentChildRelationship(from, blockToMove, fromIndex);
    addParentChildRelationship(to, blockToMove);
  }
}