import React, { createContext, useReducer } from "react";
import { initialState } from "../../data/initialState";
import { IAction } from "../../model/state/actionTypes";
import { reducer } from "../../model/state/reducer";
import { IBlock, IState } from "../../model/state/stateTypes";
import { Block, IBlockProps } from "./Block";

const Context = createContext(null);

const ContextBlock = () => {
  const [state, dispatch] = useReducer<React.Reducer<IState, IAction>>(reducer, initialState);

  const rootBlock: IBlock = state.blocksMap.get(state.rootBlockId);
  const rootBlockProps: IBlockProps = {
    id: state.rootBlockId,
    humanText: rootBlock.humanText,
    isShallowSelected: false,
    isDeepSelected: false,
    children: rootBlock.children,
    isGlobalSelectionActive: state.isSelectionActive,
    hIndex: [],
  };

  return (
    <Context.Provider value={{ state, dispatch }}>
      <div className="border border-secondary rounded p-2 m-2">
        <Block {...rootBlockProps} />
      </div>
    </Context.Provider>
  );
};

export { ContextBlock, Context };
