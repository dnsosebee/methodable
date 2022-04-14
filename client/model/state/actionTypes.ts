// actionTypes.ts - All of the action types that can be dispatched to the reducer
import { HierarchyIndex, IState } from "./stateTypes";

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
