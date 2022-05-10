// actions.ts - All of the actions that can be dispatched to the reducer

import { HIndexNotFoundError } from "../../lib/errors";
import { logAction } from "../../lib/loggers";
import { IState2 } from "../newState";
import {
  addParentChildRelationship,
  getBlockIdByHIndex,
  getDownstairsNeighborHIndex,
  getUpstairsNeighborHIndex,
  moveChildren,
  nonRootHIndex,
  removeParentChildRelationship,
  setActiveParentInfo,
} from "./actionHelpers";
import { IBlockType } from "./blockType";
import { BlockId, FocusPosition, HierarchyIndex, HumanText, IBlock, IState } from "./stateTypes";

export type ActionType = (IState) => IState;

export const startSelection = (state: IState, hIndex: HierarchyIndex): IState => {
  logAction("selection started: " + hIndex);
  hIndex = nonRootHIndex(hIndex);
  state.selectionRange.start = hIndex;
  state.selectionRange.end = hIndex;
  setActiveParentInfo(state);
  const newState: IState = {
    ...state,
    isSelectionActive: true,
    focusIndex: null,
  };
  return newState;
};

export const changeSelection = (state: IState, hIndex: HierarchyIndex): IState => {
  logAction("selection changed: " + hIndex);
  hIndex = nonRootHIndex(hIndex);
  state.selectionRange.end = hIndex;
  setActiveParentInfo(state);
  const newState: IState = { ...state };
  return newState;
};

export const mouseDownAction = (state: IState, hIndex: HierarchyIndex): IState => {
  logAction("clicked: " + hIndex);
  if (state.isSelectionActive) {
    const newState: IState = { ...state, isSelectionActive: false };
    return newState;
  }
  return state;
};

export const editHumanText = (
  state: IState,
  id: BlockId,
  humanText: HumanText,
  focusPosition: FocusPosition
): IState => {
  logAction("text edited, id: " + id + " --> text: " + humanText);
  state.blocksMap.set(id, {
    ...state.blocksMap.get(id),
    humanText: humanText,
  });
  const newState: IState = { ...state };
  return newState;
};

const insertNewBlock = (state: IState, at: HierarchyIndex, humanText: HumanText, blockType: IBlockType): IState => {
  const parentBlockId = getBlockIdByHIndex(state.blocksMap, state.rootBlockId, at.slice(0, -1));
  const parentBlock = state.blocksMap.get(parentBlockId);
  const newBlockId: BlockId = crypto.randomUUID();
  const newBlock = {
    id: newBlockId,
    humanText,
    children: [],
    parents: [parentBlockId],
    blockType,
  };
  parentBlock.children.splice(at[at.length - 1], 0, newBlockId);
  state.blocksMap.set(newBlockId, newBlock);
  return state;
}

export const enterWithNoSelection = (
  state: IState,
  hIndex: HierarchyIndex,
  id: BlockId,
  leftText: HumanText,
  rightText: HumanText
): IState => {
  logAction("entered with no selection: " + hIndex);
  const parentBlockId = getBlockIdByHIndex(state.blocksMap, state.rootBlockId, hIndex.slice(0, -1));
  const parentBlock = state.blocksMap.get(parentBlockId);
  const oldBlockId = id;
  const oldBlock = state.blocksMap.get(id);
  const newBlockId: BlockId = crypto.randomUUID();
  let newBlock: IBlock;
  const newHIndex = hIndex.slice(0, hIndex.length);
  if (leftText.length === 0) {
    // if enter is pressed at the beginning of the line, we just bump that block down a line, and focus on the new line above
    //oldBlock text stays the same
    insertNewBlock(state, hIndex, "", oldBlock.blockType);
    // newIndex stays the same
  } else if (oldBlock.children.length === 0) {
    // if the old block has no children, we add a sibling after the old block
    oldBlock.humanText = leftText;
    newBlock = {
      id: newBlockId,
      humanText: rightText,
      children: [],
      parents: [parentBlockId],
      blockType: oldBlock.blockType,
    };
    parentBlock.children.splice(hIndex[hIndex.length - 1] + 1, 0, newBlockId);
    newHIndex[hIndex.length - 1] += 1;
  } else {
    // if the old block does have children, we add a child to the old block
    oldBlock.humanText = leftText;
    oldBlock.children.unshift(newBlockId);
    newBlock = {
      id: newBlockId,
      humanText: rightText,
      children: [],
      parents: [oldBlockId],
      blockType: oldBlock.blockType,
    };
    // do nothing with parentBlock
    newHIndex.push(0);
  }
  state.blocksMap.set(newBlockId, newBlock);
  const newState: IState = {
    ...state,
    focusIndex: newHIndex,
    focusPosition: 1,
  };
  return newState;
};

export const moveCursorUpALine = (
  state: IState,
  hIndex: HierarchyIndex,
  focusPosition: FocusPosition
): IState => {
  logAction("moved cursor up a line: " + hIndex);
  // TODO
  try {
    const newState: IState = {
      ...state,
      focusIndex: getUpstairsNeighborHIndex(state.blocksMap, state.rootBlockId, hIndex),
      focusPosition: focusPosition,
    };
    return newState;
  } catch (e) {
    if (e instanceof HIndexNotFoundError) {
      return state;
    }
    throw e;
  }
};

export const moveCursorDownALine = (
  state: IState,
  hIndex: HierarchyIndex,
  focusPosition: FocusPosition
): IState => {
  logAction("moved cursor down a line: " + hIndex);
  try {
    const newState = {
      ...state,
      focusPosition: focusPosition,
      focusIndex: getDownstairsNeighborHIndex(state.blocksMap, state.rootBlockId, hIndex),
    };
    return newState;
  } catch (e) {
    if (e instanceof HIndexNotFoundError) {
      // if we can't find a downstairs neighbor, we just stay at the same index
      return state;
    }
    throw e;
  }
};

export const clearFocusLatch = (state: IState): IState => {
  logAction("focus cleared");
  state.focusIndex = null;
  // not using newState cause we don't want a rerender
  return state;
};

// making this a no-op until I come up with a logical way to do it
// only dispatched when backspace is pressed at the beginning of a block
export const backspace = (state: IState, hIndex: HierarchyIndex, id: BlockId): IState => {
  logAction("backspaced: " + hIndex);

  // current block
  const currentBlockId = id;
  const currentBlock = state.blocksMap.get(currentBlockId);

  if (hIndex.length === 0) {
    // we don't allow backspace for the root block
    return state;
  }

  // parent block
  const parentBlockId = getBlockIdByHIndex(state.blocksMap, state.rootBlockId, hIndex.slice(0, -1));
  const parentBlock = state.blocksMap.get(parentBlockId);

  // upstairs neighbor
  const upstairsNeighborhHIndex = getUpstairsNeighborHIndex(
    state.blocksMap,
    state.rootBlockId,
    hIndex
  );
  const upstairsNeighborId = getBlockIdByHIndex(
    state.blocksMap,
    state.rootBlockId,
    upstairsNeighborhHIndex
  );
  const upstairsNeighbor = state.blocksMap.get(upstairsNeighborId);

  // upstairs neighbor's parent
  const upstairsNeighborParentId = getBlockIdByHIndex(
    state.blocksMap,
    state.rootBlockId,
    upstairsNeighborhHIndex.slice(0, -1)
  );
  const upstairsNeighborParent = state.blocksMap.get(upstairsNeighborParentId);

  const focusPosition = upstairsNeighbor.humanText.length + 1;

  if (
    upstairsNeighbor.parents.length <= 1 &&
    upstairsNeighbor.children.length <= 1 &&
    upstairsNeighbor.humanText.length === 0
  ) {
    // if the upstairs neighbor is a simple blank line with a single parent and no children,
    // we shift the current line up to replace the upstairs neighbor
    // we do this even when the current block has multiple parents
    removeParentChildRelationship(parentBlock, currentBlock);
    removeParentChildRelationship(upstairsNeighborParent, upstairsNeighbor);
    state.blocksMap.delete(upstairsNeighborId);
    addParentChildRelationship(
      upstairsNeighborParent,
      currentBlock,
      upstairsNeighborhHIndex[upstairsNeighborhHIndex.length - 1]
    );
  } else if (currentBlock.parents.length > 1) {
    // if the current block has multiple parents and the upstairs neighbor is non-simple,
    // we don't do anything
    return state;
  } else if (currentBlock.children.length > 0 && upstairsNeighbor.children.length > 1) {
    // if both merging blocks have children, that's weird and we don't do anything
    return state;
  } else {
    // in all other cases,
    // we merge current block into upstairs neighbor, maintaining upstairs neighbor's id
    removeParentChildRelationship(parentBlock, currentBlock, hIndex[hIndex.length - 1]);
    moveChildren(state.blocksMap, currentBlock, upstairsNeighbor);
    if (currentBlock.parents.length === 0) {
      // TODO: might need to rethink this.
      // if the current block has no references, we delete it.
      state.blocksMap.delete(currentBlockId);
    }
    upstairsNeighbor.humanText = upstairsNeighbor.humanText + currentBlock.humanText;
  }

  const newState: IState = {
    ...state,
    focusPosition,
    focusIndex: upstairsNeighborhHIndex,
  };
  return newState;
};

export const tab = (
  state: IState,
  hIndex: HierarchyIndex,
  id: BlockId,
  focusPosition: FocusPosition
): IState => {
  logAction("tabbed: " + hIndex);
  let shouldCursorStayInParent = false;

  // parent block
  const parentBlockId = getBlockIdByHIndex(state.blocksMap, state.rootBlockId, hIndex.slice(0, -1));
  const parentBlock = state.blocksMap.get(parentBlockId);

  // current block
  const currentBlockId = id;
  const currentBlock = state.blocksMap.get(currentBlockId);

  // if we're the first child, just add an older sibling and proceed
  if (hIndex[hIndex.length - 1] === 0) {
    shouldCursorStayInParent = true;
    const newParentChildBlockId = crypto.randomUUID();
    const newParentChildBlock = {
      id: newParentChildBlockId,
      humanText: "",
      children: [],
      parents: [],
      blockType: currentBlock.blockType,
    };
    addParentChildRelationship(parentBlock, newParentChildBlock, hIndex[hIndex.length - 1]);
    state.blocksMap.set(newParentChildBlockId, newParentChildBlock);
    hIndex = [...hIndex.slice(0, -1), 1];
  }

  // previous sibling
  const previousSiblingHIndex = hIndex.slice(0, -1).concat([hIndex[hIndex.length - 1] - 1]);
  const previousSiblingId = getBlockIdByHIndex(
    state.blocksMap,
    state.rootBlockId,
    previousSiblingHIndex
  );
  const previousSibling = state.blocksMap.get(previousSiblingId);

  removeParentChildRelationship(parentBlock, currentBlock, hIndex[hIndex.length - 1]);
  addParentChildRelationship(previousSibling, currentBlock);
  const newHIndex = [...previousSiblingHIndex];
  if (!shouldCursorStayInParent) {
    const childNumber = previousSibling.children.length - 1;
    newHIndex.push(childNumber);
  }

  const newState: IState = {
    ...state,
    focusIndex: newHIndex,
    focusPosition: focusPosition,
  };
  return newState;
};

export const shiftTab = (
  state: IState,
  hIndex,
  id: BlockId,
  focusPosition: FocusPosition
): IState => {
  logAction("shift tabbed");
  if (hIndex.length <= 1) {
    return state;
  }

  // current block
  const currentBlockId = id;
  const currentBlock = state.blocksMap.get(currentBlockId);
  const currentIndex = hIndex[hIndex.length - 1];

  // parent block
  const parentBlockId = getBlockIdByHIndex(state.blocksMap, state.rootBlockId, hIndex.slice(0, -1));
  const parentBlock = state.blocksMap.get(parentBlockId);

  // grandparent block
  const grandparentHIndex = hIndex.slice(0, -2);
  const grandparentBlockId = getBlockIdByHIndex(
    state.blocksMap,
    state.rootBlockId,
    grandparentHIndex
  );
  const grandparentBlock = state.blocksMap.get(grandparentBlockId);

  removeParentChildRelationship(parentBlock, currentBlock, currentIndex);
  addParentChildRelationship(grandparentBlock, currentBlock, hIndex[hIndex.length - 2] + 1);
  moveChildren(state.blocksMap, parentBlock, currentBlock, currentIndex);
  const newHIndex = [...grandparentHIndex, hIndex[hIndex.length - 2] + 1];

  const newState: IState = {
    ...state,
    focusIndex: newHIndex,
    focusPosition: focusPosition,
  };
  return newState;
};

export const changeBlockType = (state: IState, id: BlockId, blockType: IBlockType): IState => {
  logAction("change block type");
  const currentBlock = state.blocksMap.get(id);
  currentBlock.blockType = blockType;
  return {
    ...state,
  };
};
