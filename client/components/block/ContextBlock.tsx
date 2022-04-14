import { createContext, useEffect, useReducer } from "react";
import { initialState } from "../../data/initialState";
import { reducer } from "../../model/state/reducer";
import { Block } from "./Block";

const Dispatch = createContext(null);

const ContextBlock = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <Dispatch.Provider value={dispatch}>
      <div className="border border-secondary rounded p-2 m-2">
        <Block {...state.rootBlock} />
      </div>
    </Dispatch.Provider>
  );
};

export { ContextBlock, Dispatch };
