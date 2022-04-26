// actions.ts - All of the actions that can be dispatched to the reducer

import { ActionType } from "react-hot-toast/dist/core/store";
import { logAction } from "../../lib/loggers";
import {
  IClearFocusLatchAction,
  ICursorMoveAction,
  IEditHumanTextAction,
  IEnterWithNoSelectionAction,
  ISelectionAction,
} from "./actionTypes";
import { BlockId, HierarchyIndex, IBlock, IState } from "./stateTypes";

const NONEXISTENT_HIERARCHY_INDEX: HierarchyIndex = [-1];

export const startSelection = (
  state: IState,
  action: ISelectionAction
): IState => {
  logAction("selection started: " + action.index);
  action.index = nonRootIndex(action.index);
  state.selectionRange.start = action.index;
  state.selectionRange.end = action.index;
  setActiveParentInfo(state);
  const newState: IState = {
    ...state,
    isSelectionActive: true,
    focusIndex: NONEXISTENT_HIERARCHY_INDEX,
  };
  return newState;
};

export const changeSelection = (
  state: IState,
  action: ISelectionAction
): IState => {
  logAction("selection changed: " + action.index);
  action.index = nonRootIndex(action.index);
  state.selectionRange.end = action.index;
  setActiveParentInfo(state);
  const newState: IState = { ...state };
  return newState;
};

export const mouseDown = (state: IState, action: ISelectionAction): IState => {
  logAction("clicked: " + action.index);
  if (state.isSelectionActive) {
    state = { ...state, isSelectionActive: false };
  }
  return state;
};

export const editHumanText = (
  state: IState,
  action: IEditHumanTextAction
): IState => {
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
  logAction("entered with no selection: " + action.index);
  const parentBlockId = getBlockIdByIndex(
    state.blocksMap,
    state.rootBlockId,
    action.index.slice(0, -1)
  );
  const parentBlock = state.blocksMap.get(parentBlockId);
  const oldBlockId = action.id;
  const oldBlock = state.blocksMap.get(action.id);
  const newBlockId: BlockId = crypto.randomUUID();
  let newBlock: IBlock;
  const newIndex = action.index.slice(0, action.index.length);
  if (action.oldText.length === 0) {
    // if enter is pressed at the beginning of the line, we just bump that block down a line, and focus on the new line above
    //oldBlock stays the same
    newBlock = {
      id: newBlockId,
      humanText: "",
      children: [],
      parents: [parentBlockId],
    };
    parentBlock.children.splice(
      action.index[action.index.length - 1],
      0,
      newBlockId
    );
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
    parentBlock.children.splice(
      action.index[action.index.length - 1] + 1,
      0,
      newBlockId
    );
    newIndex[action.index.length - 1] += 1;
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
    newIndex.push(0);
  }
  state.blocksMap.set(newBlockId, newBlock);
  const newState: IState = {
    ...state,
    focusIndex: newIndex,
    focusPosition: 1,
  };
  return newState;
};

export const moveCursorUpALine = (
  state: IState,
  action: ICursorMoveAction
): IState => {
  logAction(action.type + ": " + action.index);
  // TODO
  const newState: IState = {
    ...state,
    focusPosition: action.focusPosition,
    focusIndex: getUpstairsNeighborIndex(
      state.blocksMap,
      state.rootBlockId,
      action.index
    ),
  };
  return newState;
};

export const moveCursorDownALine = (
  state: IState,
  action: ICursorMoveAction
): IState => {
  logAction(action.type + ": " + action.index);
  // TODO
  const newState: IState = {
    ...state,
    focusPosition: action.focusPosition,
    focusIndex: getDownstairsNeighborIndex(
      state.blocksMap,
      state.rootBlockId,
      action.index
    ),
  };
  return newState;
};

export const clearFocusLatch = (
  state: IState,
  action: IClearFocusLatchAction
): IState => {
  logAction("focus cleared");
  state.focusIndex = NONEXISTENT_HIERARCHY_INDEX;
  // not using newState cause we don't want a rerender
  return state;
};

// const addParentChildRelationship = (parent: IBlock, child: IBlock) => {
//   parent.children.push(child.id);
//   child.parents.push(parent.id);
// };

// const removeParentChildRelationship = (parent: IBlock, child: IBlock) => {
//   parent.children.splice(parent.children.indexOf(child.id), 1);
//   child.parents.splice(child.parents.indexOf(parent.id), 1);
// };

// deals with edge case where selection is started at root
const nonRootIndex = (index: HierarchyIndex): HierarchyIndex => {
  if (index.length === 0) {
    return [0];
  }
  return index;
};

const getBlockIdByIndex = (
  blocksMap: Map<BlockId, IBlock>,
  rootBlockId: BlockId,
  index: HierarchyIndex
): BlockId => {
  let blockId = rootBlockId;
  for (let i = 0; i < index.length; i++) {
    blockId = blocksMap.get(blockId).children[index[i]];
  }
  return blockId;
};

const setActiveParentInfo = (state: IState) => {
  const { blocksMap, rootBlockId, selectionRange } = state;
  let parent: IBlock = blocksMap.get(rootBlockId);
  let activeParentIndex: HierarchyIndex = [];
  const maxParentDepth = Math.min(
    selectionRange.start.length - 1,
    selectionRange.end.length - 1
  );
  for (let i = 0; i < maxParentDepth; i++) {
    if (selectionRange.start[i] === selectionRange.end[i]) {
      parent = blocksMap.get(parent.children[selectionRange.start[i]]);
      activeParentIndex.push(selectionRange.start[i]);
    }
  }
  state.activeParentId = parent.id;
  state.activeParentIndex = activeParentIndex;
};

const getAncestorIds = (
  blocksMap: Map<BlockId, IBlock>,
  rootBlockId: BlockId,
  index: HierarchyIndex
): BlockId[] => {
  let ancestorIds: BlockId[] = [rootBlockId];
  let blockId = rootBlockId;
  for (let i = 0; i < index.length; i++) {
    blockId = blocksMap.get(blockId).children[index[i]];
    ancestorIds.push(blockId);
  }
  return ancestorIds;
};

const getDownstairsNeighborIndex = (
  blocksMap: Map<string, IBlock>,
  rootBlockId: string,
  index: HierarchyIndex
): HierarchyIndex => {
  const ancestorIds = getAncestorIds(blocksMap, rootBlockId, index);
  const newIndex = [...index, -1];
  for (let i = ancestorIds.length - 1; i >= 0; i--) {
    const ancestor = blocksMap.get(ancestorIds[i]);
    if (ancestor.children.length > newIndex[i] + 1) {
      return [...newIndex.slice(0, i), newIndex[i] + 1];
    }
  }
  return index;
};

const getYoungestDescendantIndex = (
  blocksMap: Map<string, IBlock>,
  rootBlockId: string,
  index: HierarchyIndex
): HierarchyIndex => {
  let newIndex = [...index];
  let block = blocksMap.get(getBlockIdByIndex(blocksMap, rootBlockId, index));
  while (block.children.length > 0) {
    const lastChildIndex = block.children.length - 1;
    newIndex.push(lastChildIndex);
    block = blocksMap.get(block.children[lastChildIndex]);
  }
  return newIndex;
};

const getUpstairsNeighborIndex = (
  blocksMap: Map<string, IBlock>,
  rootBlockId: string,
  index: HierarchyIndex
): HierarchyIndex => {
  if (index.length === 0) {
    return index;
  }
  if (index[index.length - 1] === 0) {
    return [...index.slice(0, index.length - 1)];
  }
  const youngerSiblingIndex = index[index.length - 1] - 1;
  const youngerSiblingHIndex = [
    ...index.slice(0, index.length - 1),
    youngerSiblingIndex,
  ];
  return getYoungestDescendantIndex(
    blocksMap,
    rootBlockId,
    youngerSiblingHIndex
  );
};
