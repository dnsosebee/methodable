import { createContext, useContext, useEffect, useReducer } from "react";
import { createView, IView, IViewData } from "../model/view";

export type ViewAction = (view: Readonly<IView>) => IView;

const viewReducer = (viewState: IView, action: ViewAction): IView => {
  const newState = action(viewState);
  return newState;
};

const viewContext = createContext(null);

export type IViewContext = { viewState: IView; viewDispatch: React.Dispatch<ViewAction> };

export const useView = (): IViewContext => {
  const context = useContext(viewContext);
  if (context === undefined) {
    throw new Error("useView must be used within a ViewProvider");
  }
  return context;
};

export interface IViewProviderProps extends IViewData {
  children: JSX.Element;
}

export const ViewProvider = (props: IViewProviderProps) => {
  const initialState = createView({
    mode: props.mode,
    rootContentId: props.rootContentId,
    rootRelativePath: props.rootRelativePath,
    focusPath: props.focusPath,
    focusPosition: "end",
  });
  const [viewState, viewDispatch] = useReducer(viewReducer, initialState);
  useEffect(() => {
    viewDispatch(
      (state: IView): IView =>
        createView({
          mode: props.mode,
          rootContentId: props.rootContentId,
          rootRelativePath: props.rootRelativePath,
          focusPath: props.focusPath,
          focusPosition: "end",
        })
    );
  }, [props]);

  return (
    <>
      <viewContext.Provider value={{ viewState, viewDispatch }}>
        {props.children}
      </viewContext.Provider>
    </>
  );
};
