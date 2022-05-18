import React, { createContext, useContext, useEffect, useReducer } from "react";
import { initialState } from "../data/initialState";
import { Action, IState, Path } from "../model/state";

const reducer = (state: IState, action: Action): IState => {
  return action(state);
};

export const Context = createContext(null);

export interface IContextWrapperProps {
  children: JSX.Element;
  rootContentId: string;
  rootRelativePath: Path;
  focusPath: Path;
  isFocusSpecifiedInPaths: boolean;
}

export const ContextWrapper = (props: IContextWrapperProps) => {
  const [state, dispatch]: [state: IState, dispatch: React.Dispatch<Action>] = useReducer<
    React.Reducer<IState, Action>
  >(reducer, initialState);
  useEffect(() => {
    dispatch(
      (state: IState): IState =>
        initialState.setPaths(
          props.rootContentId,
          props.rootRelativePath,
          props.focusPath,
          props.isFocusSpecifiedInPaths
        )
    );
  }, [props]);
  return (
    <Context.Provider value={{ state, dispatch }}>
      <div className="border border-secondary rounded p-2 m-2">{props.children}</div>
    </Context.Provider>
  );
};
