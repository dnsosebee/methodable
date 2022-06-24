import { PATH_DELIMITER, PATH_SEPARATOR } from "../../pages/[mode]/[rootContentId]";
import { BlockContentId } from "./graph/blockContent";
import { locationListAreEqual, Path } from "./graph/graph";

export type FocusPosition = number | "start" | "end";

export enum MODE {
  EDIT = "edit",
  GUIDE = "guide",
  FINISH = "finish",
}

export const strToMode = (mode: string): MODE => {
  switch (mode) {
    case "edit":
      return MODE.EDIT;
    case "guide":
      return MODE.GUIDE;
    case "finish":
      return MODE.FINISH;
    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
};

export interface IViewData {
  mode: MODE;
  rootContentId: Readonly<BlockContentId>;
  rootRelativePath: Readonly<Path>;
  focusPath: Readonly<Path | null>;
  focusPosition: Readonly<FocusPosition>;
}

export interface IViewTransitions {
  setFocus: (focusPath: Path, focusPosition: FocusPosition) => IView;
  setFocusPath: (focusPath: Path) => IView;
  setMode: (mode: MODE) => IView;
}

export interface IViewGetters {}

export interface IView extends IViewData, IViewTransitions {}

export function createView(viewData: Readonly<IViewData>): IView {
  const setFocus = (path: Path, focusPosition: FocusPosition): IView => {
    return createView({
      ...viewData,
      focusPath: path,
      focusPosition,
    });
  };
  const setFocusPath = (path: Path): IView => {
    return createView({
      ...viewData,
      focusPath: path,
    });
  };
  const setMode = (mode: MODE): IView => {
    return createView({
      ...viewData,
      mode,
    });
  };
  return Object.freeze({ ...viewData, setFocus, setMode, setFocusPath });
}

export const resolveView = (viewState: IView, view: Partial<IView>): IView => {
  let { mode, rootContentId, rootRelativePath, focusPath, focusPosition } = view;
  if (!mode) {
    mode = viewState.mode;
  }
  if (!rootContentId) {
    rootContentId = viewState.rootContentId;
  }
  if (!rootRelativePath) {
    rootRelativePath = viewState.rootRelativePath;
  }
  // focusPath is optional and can be null, so we don't need to check for it.
  if (!focusPosition) {
    focusPosition = viewState.focusPosition;
  }
  return createView({
    mode,
    rootContentId,
    rootRelativePath,
    focusPath,
    focusPosition,
  });
};

export const getLink = (viewState: IView, view: Partial<IView>): string => {
  const { mode, rootContentId, rootRelativePath, focusPath } = resolveView(viewState, view);
  return `/${mode}/${rootContentId}/${rootRelativePath.join(PATH_DELIMITER)}${
    focusPath ? PATH_SEPARATOR + focusPath.join(PATH_DELIMITER) : ""
  }`;
};

export const viewsAreEqual = (a: IView, b: IView): boolean => {
  return (
    a.mode === b.mode &&
    a.rootContentId === b.rootContentId &&
    locationListAreEqual(a.rootRelativePath, b.rootRelativePath) &&
    locationListAreEqual(a.focusPath, b.focusPath) &&
    a.focusPosition === b.focusPosition
  );
};
