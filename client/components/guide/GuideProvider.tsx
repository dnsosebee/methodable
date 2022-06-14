import { createContext, useContext, useReducer } from "react";
import { createGuide, IGuide } from "../../model/modes/guide";

export type GuideAction = (guide: Readonly<IGuide>) => IGuide;

const guideReducer = (guideState: IGuide, action: GuideAction): IGuide => {
  const newState = action(guideState);
  return newState;
};

const guideContext = createContext(null);

export type IGuideContext = { guideState: IGuide; guideDispatch: React.Dispatch<GuideAction> };

export const useGuide = (): IGuideContext => {
  const context = useContext(guideContext);
  if (context === undefined) {
    throw new Error("useGuide must be used within a ViewProvider");
  }
  return context;
};

export interface IGuideProviderProps {
  showContext?: boolean;
  showSubtasks?: boolean;
  children: React.ReactNode;
}

export const GuideProvider = (props: IGuideProviderProps) => {
  const initialState = createGuide({
    showContext: props.showContext || false,
    showSubtasks: props.showSubtasks || false,
  });
  const [guideState, guideDispatch] = useReducer(guideReducer, initialState);
  return (
    <guideContext.Provider value={{ guideState, guideDispatch }}>
      {props.children}
    </guideContext.Provider>
  );
};
