import { createContext, useContext, useEffect, useReducer } from "react";
import { createFullPath, IFullPath } from "../model/fullPath";
import { Path } from "../model/graph";

export type FullPathAction = (fullPath: Readonly<IFullPath>) => IFullPath;

const fullPathReducer = (fullPathState: IFullPath, action: FullPathAction) => {
  const newState = action(fullPathState);
  console.log("newState", JSON.stringify(newState));
  return newState;
};

const fullPathContext = createContext(null);

export type IFullPathContext = { fullPathState: IFullPath; fullPathDispatch: React.Dispatch<FullPathAction> };

export const useFullPath = (): IFullPathContext => {
  const context = useContext(fullPathContext);
  if (context === undefined) {
    throw new Error("useFullPath must be used within a FullPathProvider");
  }
  return context;
};

export interface IFullPathProviderProps {
  children: JSX.Element;
  rootContentId: string;
  rootRelativePath: Path;
  focusPath: Path;
  isFocusSpecifiedInURL: boolean;
}

export const FullPathProvider = (props: IFullPathProviderProps) => {
  const initialState = createFullPath({
    rootContentId: props.rootContentId,
    rootRelativePath: props.rootRelativePath,
    focusPath: props.focusPath,
    focusPosition: "end",
    isFocusSpecifiedInURL: props.isFocusSpecifiedInURL,
  });
  const [fullPathState, fullPathDispatch] = useReducer(fullPathReducer, initialState);
  useEffect(() => {
    fullPathDispatch(
      (state: IFullPath): IFullPath =>
        createFullPath({
          rootContentId: props.rootContentId,
          rootRelativePath: props.rootRelativePath,
          focusPath: props.focusPath,
          focusPosition: "end",
          isFocusSpecifiedInURL: props.isFocusSpecifiedInURL,
        })
    );
  }, [props]);

  return (
    <fullPathContext.Provider value={{ fullPathState, fullPathDispatch }}>
      {props.children}
    </fullPathContext.Provider>
  );
};
