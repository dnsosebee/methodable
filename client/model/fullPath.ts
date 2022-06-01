import { BlockContentId } from "./blockContent";
import { IGraph, Path } from "./graph";

export type FocusPosition = number | "start" | "end";

export interface IFullPathData {
  rootContentId: BlockContentId;
  rootRelativePath: Path;
  focusPath: Path | null;
  focusPosition: FocusPosition;
  isFocusSpecifiedInURL: boolean;
}

export interface IFullPathTransitions {
  setFocus: (focusPath: Path, focusPosition: FocusPosition) => IFullPath;
}

export interface IFullPathGetters {}

export interface IFullPath extends IFullPathData, IFullPathTransitions {}

export function createFullPath(fullPathData: IFullPathData): IFullPath {
  const setFocus = (path: Path, focusPosition: FocusPosition): IFullPath => {
    return createFullPath({
      ...fullPathData,
      focusPath: path,
      focusPosition,
    });
  };
  return Object.freeze({ ...fullPathData, setFocus });
}
