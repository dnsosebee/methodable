import React, { createContext, useReducer } from "react";
import { initialState } from "../data/initialState";
import { ModeNotFoundError } from "../lib/errors";
import { ActionType } from "../model/state/actions";
import { BlockId, IBlock, IState } from "../model/state/stateTypes";
import { Block, IBlockProps } from "./editor/Block";

const reducer = (state: IState, action: ActionType): IState => {
  return action(state);
};

export const Context = createContext(null);

export const ContextWrapper = ({children, idPath}) => {
  const [state, dispatch] = useReducer<React.Reducer<IState, ActionType>>(reducer, initialState);
  return (
    <Context.Provider value={{ state, dispatch }}>
      <div className="border border-secondary rounded p-2 m-2">
      {children}
      </div>
    </Context.Provider>
  );
};
