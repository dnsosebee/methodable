// actionTypes.ts - All of the action types that can be dispatched to the reducer
import {
  BlockId,
  FocusPosition,
  HierarchyIndex,
  HumanText,
  IState,
} from "./stateTypes";

export interface IAction {
  type: string;
}

export interface ISelectionAction extends IAction {
  type: "selection start" | "selection change" | "mouse down";
  index: HierarchyIndex;
}

export interface ICursorMoveAction extends IAction {
  type: "move cursor up" | "move cursor down";
  index: HierarchyIndex;
  focusPosition: FocusPosition;
}

export interface IEditHumanTextAction extends IAction {
  type: "text edit";
  id: BlockId;
  humanText: HumanText;
  focusPosition: FocusPosition;
}

export interface IEnterWithNoSelectionAction extends IAction {
  type: "enter with no selection";
  id: BlockId;
  index: HierarchyIndex;
  oldText: HumanText;
  newText: HumanText;
}

// export interface IFocusAction extends IAction {
//   type: "focus";
//   index: HierarchyIndex;
//   focusPosition: number;
// }

export interface IClearFocusLatchAction extends IAction {
  type: "clear focus latch";
}
