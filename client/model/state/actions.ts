// actions.ts - All of the actions that can be dispatched to the reducer

import { logAction } from "../../lib/loggers";
import {
  IChangeSelectionAction,
  IMouseDownAction,
  IStartSelectionAction,
} from "./actionTypes";
import { HierarchyIndex, IBlock, IState } from "./stateTypes";

export const startSelection = (
  state: IState,
  action: IStartSelectionAction
): IState => {
  logAction("selection started: " + action.index);
  state.isSelectionActive = true;
  state.selectionRange.start = action.index;
  state.selectionRange.end = action.index;
  setActiveParentInfo(state);
  const newState = { ...state };
  return newState;
};

export const changeSelection = (
  state: IState,
  action: IChangeSelectionAction
): IState => {
  logAction("selection changed: " + action.index);
  state.selectionRange.end = action.index;
  setActiveParentInfo(state);
  const newState = { ...state };
  return newState;
};

export const mouseDown = (state: IState, action: IMouseDownAction): IState => {
  logAction("clicked: " + action.index);
  state.isSelectionActive = false;
  setActiveParentInfo(state);
  const newState = { ...state };
  return newState;
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
