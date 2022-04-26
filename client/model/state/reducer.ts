import { IState } from "./stateTypes";
import {
  IAction,
  IClearFocusLatchAction,
  ICursorMoveAction,
  IBackspaceAction as IBackspaceAction,
  IEditHumanTextAction,
  IEnterWithNoSelectionAction,
  ISelectionAction,
  ITabAction,
} from "./actionTypes";
import {
  startSelection,
  changeSelection,
  mouseDown,
  editHumanText,
  enterWithNoSelection,
  clearFocusLatch,
  moveCursorUpALine,
  moveCursorDownALine,
  backspace,
  tab,
} from "./actions";

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "selection start":
      return startSelection(state, action as ISelectionAction);
    case "selection change":
      return changeSelection(state, action as ISelectionAction);
    case "mouse down":
      return mouseDown(state, action as ISelectionAction);
    case "text edit":
      return editHumanText(state, action as IEditHumanTextAction);
    case "enter with no selection":
      return enterWithNoSelection(state, action as IEnterWithNoSelectionAction);
    case "move cursor up":
      return moveCursorUpALine(state, action as ICursorMoveAction);
    case "move cursor down":
      return moveCursorDownALine(state, action as ICursorMoveAction);
    case "clear focus latch":
      return clearFocusLatch(state, action as IClearFocusLatchAction);
    case "backspace":
      return backspace(state, action as IBackspaceAction);
    case "tab":
      return tab(state, action as ITabAction);
    default:
      throw new Error("Couldn't find a reducer for action type: " + action.type);
  }
};
