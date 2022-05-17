import React, { createContext, useContext, useEffect, useReducer } from "react";
import { initialState } from "../data/initialState";
import { Action, IState } from "../model/state";

const reducer = (state: IState, action: Action): IState => {
  return action(state);
};

export const Context = createContext(null);

export const ContextWrapper = ({ children, contentId, idPath }) => {
  const [state, dispatch]: [state: IState, dispatch: React.Dispatch<Action>] = useReducer<
    React.Reducer<IState, Action>
  >(reducer, initialState);
  useEffect(() => {
    dispatch((state: IState): IState => initialState.setRootAndPath(contentId, idPath));
  }, [contentId, idPath]);
  return (
    <Context.Provider value={{ state, dispatch }}>
      <div className="border border-secondary rounded p-2 m-2">{children}</div>
    </Context.Provider>
  );
};
