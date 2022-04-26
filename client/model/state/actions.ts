// actions.ts - All of the actions that can be dispatched to the reducer

import { logAction } from "../../lib/loggers";
import {
  addParentChildRelationship,
  getBlockIdByHIndex,
  getDownstairsNeighborHIndex,
  getUpstairsNeighborHIndex,
  NONEXISTENT_H_INDEX,
  nonRootHIndex,
  removeParentChildRelationship,
  setActiveParentInfo,
} from "./actionHelpers";
import {
  IClearFocusLatchAction,
  ICursorMoveAction,
  IBackspaceAction,
  IEditHumanTextAction,
  IEnterWithNoSelectionAction,
  ISelectionAction,
  ITabAction,
} from "./actionTypes";
import { BlockId, IBlock, IState } from "./stateTypes";

export const startSelection = (state: IState, action: ISelectionAction): IState => {
  logAction("selection started: " + action.hIndex);
  action.hIndex = nonRootHIndex(action.hIndex);
  state.selectionRange.start = action.hIndex;
  state.selectionRange.end = action.hIndex;
  setActiveParentInfo(state);
  const newState: IState = {
    ...state,
    isSelectionActive: true,
    focusIndex: NONEXISTENT_H_INDEX,
  };
  return newState;
};

export const changeSelection = (state: IState, action: ISelectionAction): IState => {
  logAction("selection changed: " + action.hIndex);
  action.hIndex = nonRootHIndex(action.hIndex);
  state.selectionRange.end = action.hIndex;
  setActiveParentInfo(state);
  const newState: IState = { ...state };
  return newState;
};

export const mouseDown = (state: IState, action: ISelectionAction): IState => {
  logAction("clicked: " + action.hIndex);
  if (state.isSelectionActive) {
    state = { ...state, isSelectionActive: false };
  }
  return state;
};

export const editHumanText = (state: IState, action: IEditHumanTextAction): IState => {
  logAction("text edited, id: " + action.id + " --> text: " + action.humanText);
  state.blocksMap.set(action.id, {
    ...state.blocksMap.get(action.id),
    humanText: action.humanText,
  });
  const newState: IState = { ...state };
  return newState;
};

export const enterWithNoSelection = (
  state: IState,
  action: IEnterWithNoSelectionAction
): IState => {
  logAction("entered with no selection: " + action.hIndex);
  const parentBlockId = getBlockIdByHIndex(
    state.blocksMap,
    state.rootBlockId,
    action.hIndex.slice(0, -1)
  );
  const parentBlock = state.blocksMap.get(parentBlockId);
  const oldBlockId = action.id;
  const oldBlock = state.blocksMap.get(action.id);
  const newBlockId: BlockId = crypto.randomUUID();
  let newBlock: IBlock;
  const newHIndex = action.hIndex.slice(0, action.hIndex.length);
  if (action.oldText.length === 0) {
    // if enter is pressed at the beginning of the line, we just bump that block down a line, and focus on the new line above
    //oldBlock stays the same
    newBlock = {
      id: newBlockId,
      humanText: "",
      children: [],
      parents: [parentBlockId],
    };
    parentBlock.children.splice(action.hIndex[action.hIndex.length - 1], 0, newBlockId);
    // newIndex stays the same
  } else if (oldBlock.children.length === 0) {
    // if the old block has no children, we add a sibling after the old block
    oldBlock.humanText = action.oldText;
    newBlock = {
      id: newBlockId,
      humanText: action.newText,
      children: [],
      parents: [parentBlockId],
    };
    parentBlock.children.splice(action.hIndex[action.hIndex.length - 1] + 1, 0, newBlockId);
    newHIndex[action.hIndex.length - 1] += 1;
  } else {
    // if the old block does have children, we add a child to the old block
    oldBlock.humanText = action.oldText;
    oldBlock.children.unshift(newBlockId);
    newBlock = {
      id: newBlockId,
      humanText: action.newText,
      children: [],
      parents: [oldBlockId],
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

export const moveCursorUpALine = (state: IState, action: ICursorMoveAction): IState => {
  logAction(action.type + ": " + action.hIndex);
  // TODO
  const newState: IState = {
    ...state,
    focusPosition: action.focusPosition,
    focusIndex: getUpstairsNeighborHIndex(state.blocksMap, state.rootBlockId, action.hIndex),
  };
  return newState;
};

export const moveCursorDownALine = (state: IState, action: ICursorMoveAction): IState => {
  logAction(action.type + ": " + action.hIndex);
  // TODO
  const newState: IState = {
    ...state,
    focusPosition: action.focusPosition,
    focusIndex: getDownstairsNeighborHIndex(state.blocksMap, state.rootBlockId, action.hIndex),
  };
  return newState;
};

export const clearFocusLatch = (state: IState, action: IClearFocusLatchAction): IState => {
  logAction("focus cleared");
  state.focusIndex = NONEXISTENT_H_INDEX;
  // not using newState cause we don't want a rerender
  return state;
};

// making this a no-op until I come up with a logical way to do it
export const backspace = (state: IState, action: IBackspaceAction): IState => {
  logAction("backspaced: " + action.hIndex);

  // // current block
  // const currentBlockId = action.id;
  // const currentBlock = state.blocksMap.get(currentBlockId);

  // // parent block
  // const parentBlockId = getBlockIdByHIndex(
  //   state.blocksMap,
  //   state.rootBlockId,
  //   action.hIndex.slice(0, -1)
  // );
  // const parentBlock = state.blocksMap.get(parentBlockId);

  // // upstairs neighbor
  // const upstairsNeighborhHIndex = getUpstairsNeighborHIndex(
  //   state.blocksMap,
  //   state.rootBlockId,
  //   action.hIndex
  // );
  // const upstairsNeighborId = getBlockIdByHIndex(
  //   state.blocksMap,
  //   state.rootBlockId,
  //   upstairsNeighborhHIndex
  // );
  // const upstairsNeighbor = state.blocksMap.get(upstairsNeighborId);

  // // upstairs neighbor's parent
  // const upstairsNeighborParentId = getBlockIdByHIndex(
  //   state.blocksMap,
  //   state.rootBlockId,
  //   upstairsNeighborhHIndex.slice(0, -1)
  // );
  // const upstairsNeighborParent = state.blocksMap.get(upstairsNeighborParentId);

  // // move the current block up to where the upstairs neighbor is
  // removeParentChildRelationship(
  //   parentBlock,
  //   currentBlock,
  //   action.hIndex[action.hIndex.length - 1]
  // );
  // removeParentChildRelationship(
  //   upstairsNeighborParent,
  //   upstairsNeighbor,
  //   upstairsNeighborhHIndex[upstairsNeighborhHIndex.length - 1]
  // );
  // if (upstairsNeighbor.parents.length === 0) {
  //   // TODO: might need to rethink this.
  //   // if the upstairs neighbor has no references, we delete it.
  //   state.blocksMap.delete(upstairsNeighborId);
  // }
  // addParentChildRelationship(upstairsNeighborParent, currentBlock);
  // currentBlock.humanText = upstairsNeighbor.humanText + currentBlock.humanText;

  // const newState: IState = {
  //   ...state,
  //   focusPosition: upstairsNeighbor.humanText.length + 1,
  //   focusIndex: upstairsNeighborhHIndex,
  // };
  // return newState;
  return state;
};

export const tab = (state: IState, action: ITabAction): IState => {
  logAction("tabbed: " + action.hIndex);
  let shouldCursorStayInParent = false;

  // parent block
  const parentBlockId = getBlockIdByHIndex(
    state.blocksMap,
    state.rootBlockId,
    action.hIndex.slice(0, -1)
  );
  const parentBlock = state.blocksMap.get(parentBlockId);
  // if we're the first child, just add an older sibling and proceed
  if (action.hIndex[action.hIndex.length - 1] === 0) {
    shouldCursorStayInParent = true;
    const newParentChildBlockId = crypto.randomUUID();
    const newParentChildBlock = {
      id: newParentChildBlockId,
      humanText: "",
      children: [],
      parents: [],
    };
    addParentChildRelationship(
      parentBlock,
      newParentChildBlock,
      action.hIndex[action.hIndex.length - 1]
    );
    state.blocksMap.set(newParentChildBlockId, newParentChildBlock);
    action.hIndex = [...action.hIndex.slice(0, -1), 1];
  }

  // previous sibling
  const previousSiblingHIndex = action.hIndex
    .slice(0, -1)
    .concat([action.hIndex[action.hIndex.length - 1] - 1]);
  const previousSiblingId = getBlockIdByHIndex(
    state.blocksMap,
    state.rootBlockId,
    previousSiblingHIndex
  );
  const previousSibling = state.blocksMap.get(previousSiblingId);

  // current block
  const currentBlockId = action.id;
  const currentBlock = state.blocksMap.get(currentBlockId);

  removeParentChildRelationship(parentBlock, currentBlock, action.hIndex[action.hIndex.length - 1]);
  addParentChildRelationship(previousSibling, currentBlock);
  const newHIndex = [...previousSiblingHIndex];
  if (!shouldCursorStayInParent) {
    const childNumber = previousSibling.children.length - 1;
    newHIndex.push(childNumber);
  }

  const newState: IState = {
    ...state,
    focusIndex: newHIndex,
    focusPosition: action.focusPosition,
  };
  return newState;
};
