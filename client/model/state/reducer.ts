import { IState } from "./stateTypes";
import {
  IAction,
  IChangeSelectionAction,
  IClearFocusLatchAction,
  IEditHumanTextAction,
  IEnterWithNoSelectionAction,
  IMouseDownAction,
  IStartSelectionAction,
} from "./actionTypes";
import { startSelection, changeSelection, mouseDown, editHumanText, enterWithNoSelection, clearFocusLatch } from "./actions";

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "selection start":
      return startSelection(state, action as IStartSelectionAction);
    case "selection change":
      return changeSelection(state, action as IChangeSelectionAction);
    case "mouse down":
      return mouseDown(state, action as IMouseDownAction);
    case "text edit":
      return editHumanText(state, action as IEditHumanTextAction);
    case "enter with no selection":
      return enterWithNoSelection(state, action as IEnterWithNoSelectionAction);
    case "clear focus latch":
      return clearFocusLatch(state, action as IClearFocusLatchAction);
    default:
      const type = action.type;
      throw new Error(
        "Couldn't find a reducer for action type: " + action.type
      );
  }
};
