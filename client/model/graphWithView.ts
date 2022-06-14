import { NoSuchBlockError } from "../lib/errors";
import { IBlockContent } from "./graph/blockContent";
import { fullBlockFromLocatedBlockId } from "./graph/fullBlock";
import { IGraph, Path } from "./graph/graph";
import { LocatedBlockId } from "./graph/locatedBlock";
import { IView, resolveView } from "./view";

export const getContentFromPath = (
  graphState: IGraph,
  viewState: IView,
  view: Partial<IView>
): IBlockContent => {
  let { rootContentId, rootRelativePath, focusPath } = resolveView(viewState, view);
  let locatedId: LocatedBlockId;
  if (focusPath && focusPath.size > 0) {
    locatedId = focusPath.last();
  } else if (rootRelativePath.size > 0) {
    locatedId = rootRelativePath.last();
  } else {
    return graphState.blockContents.get(rootContentId);
  }
  const locatedBlock = graphState.locatedBlocks.get(locatedId);
  return graphState.blockContents.get(locatedBlock.contentId);
};

export const getUpstairsNeighborPath = (graphState: IGraph, viewState: IView, path: Path): Path => {
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
  viewState: IView,
  path: Path
): Path => {
  const content = getContentFromPath(graphState, viewState, { focusPath: path });
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
    const ancestorContent = getContentFromPath(graphState, viewState, {
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
