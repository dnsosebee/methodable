// actions.ts - All of the actions that can be dispatched to the reducer

import { logAction } from "../../lib/loggers";
import {
  IChangeSelectionAction,
  IClearFocusLatchAction,
  IEditHumanTextAction,
  IEnterWithNoSelectionAction,
  IMouseDownAction,
  IStartSelectionAction,
} from "./actionTypes";
import { BlockId, HierarchyIndex, IBlock, IState } from "./stateTypes";

const NONEXISTENT_HIERARCHY_INDEX: HierarchyIndex = [-1];

export const startSelection = (
  state: IState,
  action: IStartSelectionAction
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
  action: IChangeSelectionAction
): IState => {
  logAction("selection changed: " + action.index);
  action.index = nonRootIndex(action.index);
  state.selectionRange.end = action.index;
  setActiveParentInfo(state);
  const newState: IState = { ...state };
  return newState;
};

export const mouseDown = (state: IState, action: IMouseDownAction): IState => {
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
  state.blocksMap.set(action.id, {
    ...state.blocksMap.get(action.id),
    humanText: action.oldText,
  });
  const newBlockId: BlockId = crypto.randomUUID();
  state.blocksMap.set(newBlockId, {
    id: newBlockId,
    humanText: action.newText,
    children: [],
  });
  parentBlock.children.splice(
    action.index[action.index.length - 1] + 1,
    0,
    newBlockId
  );
  const siblingIndex = action.index.slice(0, action.index.length);
  siblingIndex[action.index.length - 1] =
    siblingIndex[action.index.length - 1] + 1;
  const newState: IState = {
    ...state,
    focusIndex: siblingIndex,
    focusPosition: 1,
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
