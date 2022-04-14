// actions.ts - All of the actions that can be dispatched to the reducer

import { logAction } from "../../lib/loggers";
import {
  IChangeSelectionAction,
  IMouseDownAction,
  IStartSelectionAction,
} from "./actionTypes";
import { IBlock, HierarchyIndex, SelectionRange, IState } from "./stateTypes";

export const startSelection = (
  state: IState,
  action: IStartSelectionAction
): IState => {
  logAction("selection started: " + action.index);
  state.isSelectionActive = true;
  state.selectionRange.start = action.index;
  state.selectionRange.end = action.index;
  propagateSelectedness(state);
  const newState = { ...state };
  return newState;
};

export const changeSelection = (
  state: IState,
  action: IChangeSelectionAction
): IState => {
  logAction("selection changed: " + action.index);
  state.selectionRange.end = action.index;
  propagateSelectedness(state);
  const newState = { ...state };
  return newState;
};

export const mouseDown = (state: IState, action: IMouseDownAction): IState => {
  logAction("clicked: " + action.index);
  state.isSelectionActive = false;
  propagateSelectedness(state);
  const newState = { ...state };
  return newState;
};

const propagateSelectedness = (state: IState): IState => {
  propagateSelectednessForBlock(state.rootBlock, false);
  if (state.isSelectionActive) {
    const blocksToPropogate = getBlocksToPropogate(
      state.selectionRange,
      state.rootBlock
    );
    blocksToPropogate.forEach((block) =>
      propagateSelectednessForBlock(block, true)
    );
  }
  return state;
};

// const getBlockByHierarchyIndex = (rootBlock: IBlock, index: HierarchyIndex): IBlock => {
//   let block = rootBlock;
//   for (let i = 0; i < index.length; i++) {
//     block = block.children[index[i]];
//   }
//   return block;
// };

const getBlocksToPropogate = (
  selectionRange: SelectionRange,
  rootBlock: IBlock
): IBlock[] => {
  // get the parent of the selection
  let parent = rootBlock;
  let depth = 0;
  const maxParentDepth = Math.min(
    selectionRange.start.length - 1,
    selectionRange.end.length - 1
  );
  for (let i = 0; i < maxParentDepth; i++) {
    if (selectionRange.start[i] === selectionRange.end[i]) {
      parent = parent.children[selectionRange.start[i]];
      depth++;
    }
  }
  // get the selected children of the parent
  const startBound = selectionRange.start[depth];
  const endBound = selectionRange.end[depth];
  if (startBound < endBound) {
    return parent.children.slice(startBound, endBound + 1);
  } else {
    return parent.children.slice(endBound, startBound + 1);
  }
};

const propagateSelectednessForBlock = (
  block: IBlock,
  isSelected: boolean
): IBlock => {
  block.selected = isSelected;
  block.children.forEach((child) =>
    propagateSelectednessForBlock(child, isSelected)
  );
  logAction(
    "propagated selectedness for block: " + block.id + " to " + isSelected
  );
  return block;
};
