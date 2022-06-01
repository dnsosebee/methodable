import { IFullPathContext, useFullPath } from "../components/FullPathProvider";
import { IGraphContext, useGraph } from "../components/GraphProvider";
import { NoSuchBlockError } from "../lib/errors";
import { IBlockContent } from "./blockContent";
import { fullBlockFromLocatedBlockId } from "./fullBlock";
import { createFullPath, IFullPath } from "./fullPath";
import { LocatedBlockId } from "./locatedBlock";

export type Path = LocatedBlockId[];

export interface IGraphWithPathsGetters {
  getContentFromPath: (paths: Partial<IFullPath>) => IBlockContent;
  getUpstairsNeighborPath: (path: Path) => Path;
  getDownstairsNeighborPath: (path: Path) => Path;
}

export type GraphWithPaths = IGraphContext & IFullPathContext & IGraphWithPathsGetters;

export const useGraphWithPaths = (): GraphWithPaths => {
  const { graphState, graphDispatch } = useGraph();
  const { fullPathState, fullPathDispatch } = useFullPath();

  const resolvePartialPath = (fullPath: Partial<IFullPath>): IFullPath => {
    let { rootContentId, rootRelativePath, focusPath, focusPosition, isFocusSpecifiedInURL } =
      fullPath;
    if (!rootContentId) {
      rootContentId = fullPathState.rootContentId;
    }
    if (!rootRelativePath) {
      rootRelativePath = fullPathState.rootRelativePath;
    }
    if (!focusPath) {
      focusPath = [];
    }
    if (!focusPosition) {
      focusPosition = fullPathState.focusPosition;
    }
    if (!isFocusSpecifiedInURL) {
      isFocusSpecifiedInURL = fullPathState.isFocusSpecifiedInURL;
    }
    return createFullPath({
      rootContentId,
      rootRelativePath,
      focusPath,
      focusPosition,
      isFocusSpecifiedInURL,
    });
  };

  const getContentFromPath = (fullPath: Partial<IFullPath>): IBlockContent => {
    let { rootContentId, rootRelativePath, focusPath } = resolvePartialPath(fullPath);
    let locatedId: LocatedBlockId;
    if (focusPath.length > 0) {
      locatedId = focusPath[focusPath.length - 1];
    } else if (rootRelativePath.length > 0) {
      locatedId = rootRelativePath[rootRelativePath.length - 1];
    } else {
      return graphState.blockContents.get(rootContentId);
    }
    const locatedBlock = graphState.locatedBlocks.get(locatedId);
    return graphState.blockContents.get(locatedBlock.contentId);
  };

  const getUpstairsNeighborPath = (path: Path): Path => {
    if (path.length < 1) {
      // root block has no upstairs neighbor
      throw new NoSuchBlockError();
    }
    const locatedBlockId = path[path.length - 1];
    const locatedBlock = graphState.locatedBlocks.get(locatedBlockId);
    const parentBlockContent = graphState.blockContents.get(locatedBlock.parentId);
    if (parentBlockContent.getLeftmostChildId() === locatedBlock.id) {
      return path.slice(0, -1);
    }
    console.log("parent: " + parentBlockContent.toString());
    console.log("located: " + locatedBlockId.toString());
    let upstairsNeighborId = parentBlockContent.getLeftSiblingIdOf(locatedBlockId);
    let upstairsNeighborPath = [...path.slice(0, -1), upstairsNeighborId];
    let upstairsNeighbor = fullBlockFromLocatedBlockId(graphState, upstairsNeighborId);
    while (upstairsNeighbor.blockContent.hasChildren()) {
      upstairsNeighborId = upstairsNeighbor.blockContent.getRightmostChildId();
      upstairsNeighbor = fullBlockFromLocatedBlockId(graphState, upstairsNeighborId);
      upstairsNeighborPath.push(upstairsNeighborId);
    }
    return upstairsNeighborPath;
  };

  const getDownstairsNeighborPath = (path: Path): Path => {
    const content = getContentFromPath({ focusPath: path });
    if (content.hasChildren()) {
      // if current block has children, downstairs neighbor is the first child
      return [...path, content.getLeftmostChildId()];
    }
    if (path.length < 1) {
      throw new NoSuchBlockError();
    }
    for (let i = path.length - 1; i >= 0; i--) {
      let youngerAncestorId = path[i];
      const ancestorPath = path.slice(0, i);
      const ancestorContent = getContentFromPath({ focusPath: ancestorPath });
      const rightmostChildId = ancestorContent.getRightmostChildId();
      if (rightmostChildId !== youngerAncestorId) {
        // then we've found the point where there's a younger sibling (the downstairs neighbor)
        return [...ancestorPath, ancestorContent.getRightSiblingIdOf(youngerAncestorId)];
      }
    }
    throw new NoSuchBlockError();
  };

  return Object.freeze({
    graphState,
    graphDispatch,
    fullPathState,
    fullPathDispatch,
    getContentFromPath,
    getUpstairsNeighborPath,
    getDownstairsNeighborPath,
  });
};
