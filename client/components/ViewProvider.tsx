import Link from "next/link";
import { createContext, useContext, useEffect, useReducer } from "react";
import { createView, getLink, IView, IViewData, resolveView } from "../model/view";

export type ViewAction = (view: Readonly<IView>) => IView;

const viewReducer = (viewState: IView, action: ViewAction): IView => {
  const newState = action(viewState);
  return newState;
};

const viewContext = createContext(null);

export type IViewContext = {
  viewState: IView;
  viewDispatch: React.Dispatch<ViewAction>;
  RedirectView: (redirectViewProps: IRedirectViewProps) => JSX.Element;
};

export const useView = (): IViewContext => {
  const context = useContext(viewContext);
  if (context === undefined) {
    throw new Error("useView must be used within a ViewProvider");
  }
  return context;
};

export interface IViewProviderProps extends IViewData {
  children: JSX.Element;
  redirectToUrl?: boolean;
}

export interface IRedirectViewProps {
  partialView: Partial<IView>;
  children: JSX.Element;
  className?: string;
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

  // Redirects the view. If this is an outer context, redirects via URL, else via dispatching to the reducer in context.
  const RedirectView = (redirectViewProps: IRedirectViewProps): JSX.Element => {
    const { partialView, children, className } = redirectViewProps;
    if (props.redirectToUrl) {
      return (
        <Link href={getLink(viewState, partialView)}>
          <a className={className ? className : ""}>{children}</a>
        </Link>
      );
    } else {
      return (
        <button
          className={className ? className : ""}
          onClick={() => viewDispatch((viewState) => resolveView(viewState, partialView))}
        >
          {children}
        </button>
      );
    }
  };

  return (
    <>
      <viewContext.Provider value={{ viewState, viewDispatch, RedirectView }}>
        {props.children}
      </viewContext.Provider>
    </>
  );
};
