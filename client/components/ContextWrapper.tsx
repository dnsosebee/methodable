import React, { createContext, useReducer } from "react";
import { initialState } from "../data/initialState";
import { ActionType2 } from "../model/newActions";
import { IState2 } from "../model/newState";

const reducer = (state: IState2, action: ActionType2): IState2 => {
  return action(state);
};

export const Context = createContext(null);

export const ContextWrapper = ({ children, idPath }) => {
  const [state, dispatch]: [state: IState2, dispatch: React.Dispatch<ActionType2>] = useReducer<
    React.Reducer<IState2, ActionType2>
  >(reducer, initialState);
  return (
    <Context.Provider value={{ state, dispatch }}>
      <div className="border border-secondary rounded p-2 m-2">{children}</div>
    </Context.Provider>
  );
};
