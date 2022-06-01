import { List } from "immutable";
import { IFullPathContext, useFullPath } from "../components/FullPathProvider";
import { IGraphContext, useGraph } from "../components/GraphProvider";
import { NoSuchBlockError } from "../lib/errors";
import { IBlockContent } from "./blockContent";
import { fullBlockFromLocatedBlockId } from "./fullBlock";
import { createFullPath, IFullPath } from "./fullPath";
import { IGraph, Path } from "./graph";
import { LocatedBlockId } from "./locatedBlock";

export const resolvePartialPath = (
  fullPathState: IFullPath,
  fullPath: Partial<IFullPath>
): IFullPath => {
  let { rootContentId, rootRelativePath, focusPath, focusPosition, isFocusSpecifiedInURL } =
    fullPath;
  if (!rootContentId) {
    rootContentId = fullPathState.rootContentId;
  }
  if (!rootRelativePath) {
    rootRelativePath = fullPathState.rootRelativePath;
  }
  if (!focusPath) {
    focusPath = List();
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

export const getContentFromPath = (
  graphState: IGraph,
  fullPathState: IFullPath,
  fullPath: Partial<IFullPath>
): IBlockContent => {
  let { rootContentId, rootRelativePath, focusPath } = resolvePartialPath(fullPathState, fullPath);
  let locatedId: LocatedBlockId;
  if (focusPath.size > 0) {
    locatedId = focusPath.last();
  } else if (rootRelativePath.size > 0) {
    locatedId = rootRelativePath.last();
  } else {
    return graphState.blockContents.get(rootContentId);
  }
  const locatedBlock = graphState.locatedBlocks.get(locatedId);
  return graphState.blockContents.get(locatedBlock.contentId);
};

export const getUpstairsNeighborPath = (
  graphState: IGraph,
  fullPathState: IFullPath,
  path: Path
): Path => {
  if (path.size < 1) {
    // root block has no upstairs neighbor
    throw new NoSuchBlockError();
  }
  const locatedBlockId = path.last();
  const locatedBlock = graphState.locatedBlocks.get(locatedBlockId);
  const parentBlockContent = graphState.blockContents.get(locatedBlock.parentId);
  if (parentBlockContent.getLeftmostChildId() === locatedBlock.id) {
    return path.slice(0, -1);
  }
  let upstairsNeighborId = parentBlockContent.getLeftSiblingIdOf(locatedBlockId);
  let upstairsNeighborPath = path.set(-1, upstairsNeighborId);
  let upstairsNeighbor = fullBlockFromLocatedBlockId(graphState, upstairsNeighborId);
  while (upstairsNeighbor.blockContent.hasChildren()) {
    upstairsNeighborId = upstairsNeighbor.blockContent.getRightmostChildId();
    upstairsNeighbor = fullBlockFromLocatedBlockId(graphState, upstairsNeighborId);
    upstairsNeighborPath = upstairsNeighborPath.push(upstairsNeighborId);
  }
  return upstairsNeighborPath;
};

export const getDownstairsNeighborPath = (
  graphState: IGraph,
  fullPathState: IFullPath,
  path: Path
): Path => {
  const content = getContentFromPath(graphState, fullPathState, { focusPath: path });
  if (content.hasChildren()) {
    // if current block has children, downstairs neighbor is the first child
    return path.push(content.getLeftmostChildId());
  }
  if (path.size < 1) {
    throw new NoSuchBlockError();
  }
  for (let i = path.size - 1; i >= 0; i--) {
    let youngerAncestorId = path.get(i);
    const ancestorPath = path.slice(0, i);
    const ancestorContent = getContentFromPath(graphState, fullPathState, {
      focusPath: ancestorPath,
    });
    const rightmostChildId = ancestorContent.getRightmostChildId();
    if (rightmostChildId !== youngerAncestorId) {
      // then we've found the point where there's a younger sibling (the downstairs neighbor)
      return ancestorPath.push(ancestorContent.getRightSiblingIdOf(youngerAncestorId));
    }
  }
  throw new NoSuchBlockError();
};
