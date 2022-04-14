import { IState } from "./stateTypes";
import {
  IAction,
  IChangeSelectionAction,
  IMouseDownAction,
  IStartSelectionAction,
} from "./actionTypes";
import { startSelection, changeSelection, mouseDown } from "./actions";

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "selection start":
      return startSelection(state, action as IStartSelectionAction);
    case "selection change":
      return changeSelection(state, action as IChangeSelectionAction);
    case "mouse down":
      return mouseDown(state, action as IMouseDownAction);
    default:
      const type = action.type;
      throw new Error(
        "Couldn't find a reducer for action type: " + action.type
      );
  }
};
