// actionTypes.ts - All of the action types that can be dispatched to the reducer
import { BlockId, HierarchyIndex, HumanText, IState } from "./stateTypes";

export interface IAction {
  type: string;
}

export interface IStartSelectionAction extends IAction {
  type: "selection start";
  index: HierarchyIndex;
}

export interface IChangeSelectionAction extends IAction {
  type: "selection change";
  index: HierarchyIndex;
}

export interface IMouseDownAction extends IAction {
  type: "mouse down";
  index: HierarchyIndex;
}

export interface IEditHumanTextAction extends IAction {
  type: "text edit";
  id: BlockId;
  humanText: HumanText;
  focusPosition: number;
};

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
