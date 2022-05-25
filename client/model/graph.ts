// crockford object for state
import { NoSuchBlockError } from "../lib/errors";
import {
  blockContent,
  BlockContentId,
  contentFromJson,
  contentToJson,
  HumanText,
  IBlockContent,
} from "./blockContent";
import { fullBlockFromLocatedBlockId } from "./fullBlock";
import {
  ILocatedBlock,
  locatedBlock,
  locatedBlockFromJson,
  LocatedBlockId,
  locatedBlockToJson,
} from "./locatedBlock";
import { IVerb } from "./verbs/verb";

// types
export type UserId = string;
export type SelectionRange = { start: Path; end: Path };
export type FocusPosition = number | "start" | "end";
export type Path = LocatedBlockId[];
export interface IFullPath {
  rootContentId?: BlockContentId;
  rootRelativePath?: Path;
  focusPath?: Path;
}
export interface IProgress {
  content: IBlockContent;
  locatedChildId: LocatedBlockId;
}

//actions
export type GraphAction = (state: IGraph) => IGraph;

export interface IGraphData {
  // persistent
  locatedBlocks: Map<LocatedBlockId, ILocatedBlock>;
  blockContents: Map<BlockContentId, IBlockContent>;
  // transient, f(page): where are we?
  rootContentId: BlockContentId;
  rootRelativePath: Path;
  // selection related
  activeParentPath: Path;
  selectionRange: SelectionRange;
  isSelectionActive: boolean;
  isSelectionDeep: boolean;
  // focus related: focusPath is relative to locatedIdPath, which is relative to rootContentId
  // focus is also used to store progress in a program
  focusPath: Path | null;
  focusPosition: FocusPosition;
  isFocusSpecifiedInURL: boolean;
}

export interface IGraphTransitions {
  // no-op transition (to cause re-render)
  refresh: () => IGraph;

  // selection related
  setSelectionParent: () => IGraph;
  startSelection: (path: Path) => IGraph;
  changeSelection: (path: Path) => IGraph;
  endSelection: () => IGraph;
  toggleSelectionType: () => IGraph;

  // focus related
  setFocusLatch: (path: Path, focusPosition: FocusPosition) => IGraph;
  clearFocusLatch: () => IGraph; // DEPRECATED

  // path related
  setPaths: (
    rootContentId: BlockContentId,
    rootRelativePath: Path,
    focusPath: Path,
    isFocusSpecifiedInURL: boolean
  ) => IGraph;

  // block transitions
  updateBlockText: (blockContentId: BlockContentId, humanText: HumanText) => IGraph;
  updateBlockVerb: (blockContentId: BlockContentId, verb: IVerb) => IGraph;
  linkNewContent: (LocatedBlockId: LocatedBlockId, blockContentId: BlockContentId) => IGraph;
  insertNewBlock: (
    leftId: LocatedBlockId,
    parentContentId: BlockContentId,
    humanText: HumanText,
    verb: IVerb,
    locatedBlockId?: LocatedBlockId
  ) => IGraph;
  insertNewLocatedBlock: (
    leftId: LocatedBlockId,
    parentContentId: BlockContentId,
    blockContentId: BlockContentId,
    locatedBlockId?: LocatedBlockId
  ) => IGraph;
  moveLocatedBlock: (
    LocatedBlockId: LocatedBlockId,
    newLeftId: LocatedBlockId,
    newParentContentId: BlockContentId
  ) => IGraph;
  removeLocatedBlock: (LocatedBlockId: LocatedBlockId) => IGraph;
  removeSurroundingBlocks: (LocatedBlock: ILocatedBlock) => IGraph;
  addSurroundingBlocks: (locatedBlock: ILocatedBlock) => IGraph;
  moveChildren: (leftmostChildId: LocatedBlockId, newParentContentId: BlockContentId) => IGraph;
}

export interface IGraphGetters {
  getUpstairsNeighborPath: (path: Path) => Path;
  getDownstairsNeighborPath: (path: Path) => Path;
  // gets the content at the end of the path, or the end of rootRelativePath if path is empty
  getContentFromPath: (data: {
    contentId?: BlockContentId;
    rootRelativePath?: Path;
    focusPath?: Path;
  }) => IBlockContent;
  toString: () => string;
}

export interface IGraph extends IGraphData, IGraphTransitions, IGraphGetters {}

export function createGraph(graphData: IGraphData): IGraph {
  const transitions: IGraphTransitions = {
    // no-op transition (to cause re-render)
    refresh: () => createGraph(graphData),

    // selection related
    toggleSelectionType: () => {
      return createGraph({
        ...graphData,
        isSelectionDeep: !graphData.isSelectionDeep,
      });
    },
    setSelectionParent: (): IGraph => {
      // must run after selectionRange is updated
      const { selectionRange } = graphData;
      const maxParentDepth = Math.min(
        selectionRange.start.length - 1,
        selectionRange.end.length - 1
      );
      let parentDepth = 0;
      for (let i = 0; i < maxParentDepth; i++) {
        if (selectionRange.start[i] === selectionRange.end[i]) {
          parentDepth += 1;
        } else {
          break;
        }
      }
      return createGraph({
        ...graphData,
        activeParentPath: selectionRange.start.slice(0, parentDepth),
      });
    },
    startSelection: (path: Path) => {
      if (path.length < 1) {
        throw new Error("Can't select root block");
      }
      return createGraph({
        ...graphData,
        selectionRange: { start: path, end: path },
        isSelectionActive: true,
        focusPath: null,
      }).setSelectionParent();
    },
    changeSelection: (path: Path) => {
      if (path.length < 1) {
        throw new Error("Can't select root block");
      }
      return createGraph({
        ...graphData,
        selectionRange: { start: graphData.selectionRange.start, end: path },
      }).setSelectionParent();
    },
    endSelection: () => {
      return createGraph({
        ...graphData,
        isSelectionActive: false,
      });
    },

    // cursor moves
    setFocusLatch: (path: Path, focusPosition: FocusPosition): IGraph => {
      return createGraph({
        ...graphData,
        focusPath: path,
        focusPosition,
      });
    },
    clearFocusLatch: (): IGraph => {
      return createGraph({
        ...graphData,
        focusPath: null,
      });
    },

    // path related
    setPaths: (
      rootContentId: BlockContentId,
      rootRelativePath: Path,
      focusPath: Path,
      isFocusSpecifiedInURL: boolean
    ): IGraph => {
      return createGraph({
        ...graphData,
        rootContentId,
        rootRelativePath,
        focusPath,
        isFocusSpecifiedInURL,
      });
    },

    // block transitions
    updateBlockText: (blockContentId: BlockContentId, humanText: HumanText): IGraph => {
      const blockContent = graphData.blockContents.get(blockContentId);
      if (!blockContent) {
        throw new Error(`blockContentId ${blockContentId} not found`);
      }
      return createGraph({
        ...graphData,
        blockContents: graphData.blockContents.set(
          blockContentId,
          blockContent.updateHumanText(humanText)
        ),
      });
    },
    updateBlockVerb: (blockContentId: BlockContentId, verb: IVerb): IGraph => {
      const blockContent = graphData.blockContents.get(blockContentId);
      if (!blockContent) {
        throw new Error(`blockContentId ${blockContentId} not found`);
      }
      return createGraph({
        ...graphData,
        blockContents: graphData.blockContents.set(blockContentId, blockContent.updateVerb(verb)),
      });
    },
    linkNewContent: (locatedBlockId: LocatedBlockId, blockContentId: BlockContentId): IGraph => {
      const locatedBlock = graphData.locatedBlocks.get(locatedBlockId);

      // remove location from the old content
      const existingContent = graphData.blockContents.get(locatedBlock.contentId);
      const updatedExistingContent = existingContent.removeLocation(locatedBlockId);

      // add location to the new content
      const newContent = graphData.blockContents.get(blockContentId);
      const updatedNewContent = newContent.addLocation(locatedBlockId);

      // update the located block
      const updatedLocatedBlock = locatedBlock.setContentId(blockContentId);

      // reset the maps
      graphData.locatedBlocks.set(locatedBlockId, updatedLocatedBlock);
      graphData.blockContents.set(blockContentId, updatedNewContent);
      if (updatedExistingContent.locatedBlocks.length < 1) {
        // if the content we're replacing only has this location,
        // let's delete the content from the graph
        graphData.blockContents.delete(locatedBlock.contentId);
      } else {
        // otherwise, update the existing content
        graphData.blockContents.set(locatedBlock.contentId, updatedExistingContent);
      }
      return createGraph({
        ...graphData,
      });
    },
    insertNewBlock: (
      leftId: LocatedBlockId,
      parentContentId: BlockContentId,
      humanText: HumanText,
      verb: IVerb,
      locatedBlockId: LocatedBlockId = crypto.randomUUID()
    ) => {
      // insert new block content
      const newBlockContentId = crypto.randomUUID();
      const newBlockContent = blockContent({
        id: newBlockContentId,
        verb,
        humanText,
        userId: "TODO",
        childLocatedBlocks: [],
        locatedBlocks: [],
      });
      graphData.blockContents.set(newBlockContentId, newBlockContent);

      // then insert new located block
      return createGraph(graphData).insertNewLocatedBlock(
        leftId,
        parentContentId,
        newBlockContentId,
        locatedBlockId
      );
    },
    insertNewLocatedBlock: (
      leftId: LocatedBlockId,
      parentContentId: BlockContentId,
      blockContentId: BlockContentId,
      locatedBlockId: LocatedBlockId = crypto.randomUUID()
    ): IGraph => {
      // insert new locatedBlock
      const newLocatedBlock = locatedBlock({
        id: locatedBlockId,
        parentId: parentContentId,
        contentId: blockContentId,
        userId: "TODO",
        blockStatus: "not started",
        leftId,
        archived: false,
      });
      graphData.locatedBlocks.set(locatedBlockId, newLocatedBlock);

      // update blockContent
      const blockContent = graphData.blockContents.get(blockContentId);
      const updatedBlockContent = blockContent.addLocation(locatedBlockId);
      graphData.blockContents.set(blockContentId, updatedBlockContent);

      // then update surrounding blocks
      return createGraph(graphData).addSurroundingBlocks(newLocatedBlock);
    },
    addSurroundingBlocks: (locatedBlock: ILocatedBlock): IGraph => {
      // should remove this from the public interface

      // update blockContent parent
      const parentContentId = locatedBlock.parentId;
      const parentContent = graphData.blockContents.get(parentContentId);
      graphData.blockContents.set(
        parentContent.id,
        parentContent.addChildAfter(locatedBlock.leftId, locatedBlock.id)
      );

      // update locatedBlock to the right
      const rightLocatedBlockId = parentContent.getRightSiblingIdOf(locatedBlock.id);
      if (rightLocatedBlockId) {
        const rightLocatedBlock = graphData.locatedBlocks.get(rightLocatedBlockId);
        graphData.locatedBlocks.set(
          rightLocatedBlockId,
          rightLocatedBlock.setLeftId(locatedBlock.id)
        );
      }
      return createGraph(graphData);
    },
    removeLocatedBlock: (locatedBlockId: LocatedBlockId): IGraph => {
      const { locatedBlock, blockContent } = fullBlockFromLocatedBlockId(graphData, locatedBlockId);

      // archive locatedBlock
      graphData.locatedBlocks.set(locatedBlockId, locatedBlock.setArchived(true));

      // remove location from the associated content
      const updatedBlockContent = blockContent.removeLocation(locatedBlockId);
      if (updatedBlockContent.locatedBlocks.length < 1) {
        // if the content only has this location,
        // let's delete the content from the graph
        graphData.blockContents.delete(blockContent.id);
      } else {
        // otherwise, update the existing content
        graphData.blockContents.set(blockContent.id, updatedBlockContent);
      }

      // update surrounding blocks
      return createGraph(graphData).removeSurroundingBlocks(locatedBlock);
    },
    removeSurroundingBlocks: (located: ILocatedBlock): IGraph => {
      // should remove this function from the public interface
      const { parentId, leftId } = located;
      const parentContent = graphData.blockContents.get(parentId);

      // update locatedBlock to the right
      const rightLocatedBlockId = parentContent.getRightSiblingIdOf(located.id);
      if (rightLocatedBlockId) {
        const rightLocatedBlock = graphData.locatedBlocks.get(rightLocatedBlockId);
        graphData.locatedBlocks.set(rightLocatedBlockId, rightLocatedBlock.setLeftId(leftId));
      }

      // update blockContent parent
      graphData.blockContents.set(parentContent.id, parentContent.removeChild(located.id));
      return createGraph(graphData);
    },
    moveLocatedBlock: (
      locatedBlockId: LocatedBlockId,
      newLeftId: LocatedBlockId,
      newParentContentId: BlockContentId
    ): IGraph => {
      const located = graphData.locatedBlocks.get(locatedBlockId);
      const updatedLocatedBlock = located.setLeftId(newLeftId).setParentId(newParentContentId);
      graphData.locatedBlocks.set(locatedBlockId, updatedLocatedBlock);
      return createGraph(graphData)
        .removeSurroundingBlocks(located)
        .addSurroundingBlocks(updatedLocatedBlock);
    },
    // moves children starting at leftmostChildLocatedId to the end of newParentContent's children
    // could be optimized
    moveChildren: (
      leftmostChildLocatedId: LocatedBlockId,
      newParentContentId: BlockContentId
    ): IGraph => {
      if (!leftmostChildLocatedId) {
        // base case
        return createGraph(graphData);
      }
      // old parent
      const leftmostChildLocated = graphData.locatedBlocks.get(leftmostChildLocatedId);
      const oldParentContent = graphData.blockContents.get(leftmostChildLocated.parentId);
      const nextLeftmostChildId = oldParentContent.getRightSiblingIdOf(leftmostChildLocatedId);

      // new parent
      const newParentContent = graphData.blockContents.get(newParentContentId);
      const newParentRightmostChildId = newParentContent.getRightmostChildId();

      return createGraph(graphData)
        .moveLocatedBlock(leftmostChildLocatedId, newParentRightmostChildId, newParentContentId)
        .moveChildren(nextLeftmostChildId, newParentContentId);
    },
  };

  const getUpstairsNeighborPath = (path: Path): Path => {
    if (path.length < 1) {
      // root block has no upstairs neighbor
      throw new NoSuchBlockError();
    }
    const locatedBlockId = path[path.length - 1];
    const locatedBlock = graphData.locatedBlocks.get(locatedBlockId);
    const parentBlockContent = graphData.blockContents.get(locatedBlock.parentId);
    if (parentBlockContent.getLeftmostChildId() === locatedBlock.id) {
      return path.slice(0, -1);
    }
    console.log("parent: " + parentBlockContent.toString());
    console.log("located: " + locatedBlockId.toString());
    let upstairsNeighborId = parentBlockContent.getLeftSiblingIdOf(locatedBlockId);
    let upstairsNeighborPath = [...path.slice(0, -1), upstairsNeighborId];
    let upstairsNeighbor = fullBlockFromLocatedBlockId(graphData, upstairsNeighborId);
    while (upstairsNeighbor.blockContent.hasChildren()) {
      upstairsNeighborId = upstairsNeighbor.blockContent.getRightmostChildId();
      upstairsNeighbor = fullBlockFromLocatedBlockId(graphData, upstairsNeighborId);
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

  const resolvePath = (fullPath: IFullPath): IFullPath => {
    let { rootContentId, rootRelativePath, focusPath } = fullPath;
    if (!rootContentId) {
      rootContentId = graphData.rootContentId;
    }
    if (!rootRelativePath) {
      rootRelativePath = graphData.rootRelativePath;
    }
    if (!focusPath) {
      focusPath = [];
    }
    return {
      rootContentId,
      rootRelativePath,
      focusPath,
    };
  };

  const getContentFromPath = (fullPath: IFullPath): IBlockContent => {
    let { rootContentId, rootRelativePath, focusPath } = resolvePath(fullPath);
    let locatedId: LocatedBlockId;
    if (focusPath.length > 0) {
      locatedId = focusPath[focusPath.length - 1];
    } else if (rootRelativePath.length > 0) {
      locatedId = rootRelativePath[rootRelativePath.length - 1];
    } else {
      return graphData.blockContents.get(rootContentId);
    }
    const locatedBlock = graphData.locatedBlocks.get(locatedId);
    return graphData.blockContents.get(locatedBlock.contentId);
  };

  const getProgress = (focusPath: Path): IProgress[] => {
    const progress: IProgress[] = [];
    for (let i = 0; i <= focusPath.length; ++i) {
      const locatedChildId = focusPath[i];
      progress.push({
        content: getContentFromPath({ focusPath: focusPath.slice(0, i) }),
        locatedChildId,
      });
    }
    return progress;
  };

  const getNextInstructionPath = (fullPath: IFullPath): IFullPath => {
    // const { rootContentId, rootRelativePath, focusPath } = resolvePath(fullPath);
    // const progress = getProgress(focusPath);
    // while (progress[progress.length].content.)
    return null;
  };

  const toString = (): string => {
    const contentsArray = [];
    graphData.blockContents.forEach((content, id) => {
      contentsArray.push(content.toString());
    });
    const locationsArray = [];
    graphData.locatedBlocks.forEach((located, id) => {
      locationsArray.push(located.toString());
    });
    let str = `BlockGraph -- focusPath: ${graphData.focusPath}\n`;
    str += `BlockContents:\n${contentsArray.join("\n")}\n`;
    str += `LocatedBlocks:\n${locationsArray.join("\n")}\n`;
    return str;
  };

  const getters = {
    getUpstairsNeighborPath,
    getDownstairsNeighborPath,
    getContentFromPath,
    toString,
  };

  return Object.freeze({
    ...graphData,
    ...transitions,
    ...getters,
  });
}

export const stateToJson = (graph: IGraph): string => {
  const { blockContents, locatedBlocks } = graph;
  const contentsArray = [];
  blockContents.forEach(function (val, key) {
    contentsArray.push(contentToJson(val));
  });
  const locatedBlocksArray = [];
  locatedBlocks.forEach(function (val, key) {
    locatedBlocksArray.push(locatedBlockToJson(val));
  });
  return JSON.stringify({
    blockContents: contentsArray,
    locatedBlocks: locatedBlocksArray,
  });
};

export const stateFromJson = (json: string, graph: IGraph): IGraph => {
  const parsed = JSON.parse(json);
  const blockContents: Map<BlockContentId, IBlockContent> = new Map();
  const locatedBlocks: Map<LocatedBlockId, ILocatedBlock> = new Map();
  const blockContentsChildren: Map<BlockContentId, LocatedBlockId[]> = new Map();
  parsed.blockContents.forEach(function (val) {
    blockContents.set(val.id, contentFromJson(val));
    blockContentsChildren.set(val.id, []);
  });
  parsed.locatedBlocks.forEach(function (val) {
    if (!val.archived) {
      blockContents.set(val.contentId, blockContents.get(val.contentId).addLocation(val.id));
      if (val.parentId) {
        blockContentsChildren.get(val.parentId).push(val.id);
      }
    }
    locatedBlocks.set(val.id, locatedBlockFromJson(val));
  });
  blockContentsChildren.forEach((val: LocatedBlockId[], key) => {
    let left = null;
    while (val.length > 0) {
      const childId = val.find((id) => {
        const child = locatedBlocks.get(id);
        if (child.leftId === left) {
          return true;
        }
        return false;
      });
      blockContents.set(key, blockContents.get(key).addChildAfter(left, childId));
      left = childId;
      val.splice(val.indexOf(childId), 1);
    }
  });
  const newGraph = createGraph({
    blockContents,
    locatedBlocks,
    rootContentId: graph.rootContentId,
    rootRelativePath: graph.rootRelativePath,
    activeParentPath: graph.activeParentPath,
    selectionRange: graph.selectionRange,
    isSelectionActive: graph.isSelectionActive,
    isSelectionDeep: graph.isSelectionDeep,
    focusPath: graph.focusPath,
    focusPosition: graph.focusPosition,
    isFocusSpecifiedInURL: graph.isFocusSpecifiedInURL,
  });
  return newGraph;
};
