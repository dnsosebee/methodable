// actionTypes.ts - All of the action types that can be dispatched to the reducer
import { BlockType } from "./blockType";
import { BlockId, FocusPosition, HierarchyIndex, HumanText, IState } from "./stateTypes";

export interface IAction {
  type: string;
}

export interface ISelectionAction extends IAction {
  type: "selection start" | "selection change" | "mouse down";
  hIndex: HierarchyIndex;
}

export interface ICursorMoveAction extends IAction {
  type: "move cursor up" | "move cursor down";
  hIndex: HierarchyIndex;
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
  hIndex: HierarchyIndex;
  oldText: HumanText;
  newText: HumanText;
}

export interface IBackspaceAction extends IAction {
  type: "backspace";
  hIndex: HierarchyIndex;
  id: BlockId;
  humanText: HumanText;
}

export interface ITabAction extends IAction {
  type: "tab" | "shift tab";
  hIndex: HierarchyIndex;
  id: BlockId;
  focusPosition: number;
}

export interface IClearFocusLatchAction extends IAction {
  type: "clear focus latch";
}

export interface IChangeBlockTypeAction extends IAction {
  type: "change block type";
  id: BlockId;
  blockType: BlockType;
}