// crockford object for state
import {
  createBlockContent,
  BlockContentId,
  contentFromJson,
  contentToJson,
  HumanText,
  IBlockContent,
} from "./blockContent";
import { fullBlockFromLocatedBlockId } from "./fullBlock";
import {
  ILocatedBlock,
  createLocatedBlock,
  locatedBlockFromJson,
  LocatedBlockId,
  locatedBlockToJson,
} from "./locatedBlock";
import { IVerb } from "./verbs/verb";
import { List, Map } from "immutable";

// types
export type UserId = string;
export type SelectionRange = Readonly<{ start: Path; end: Path }>;
export type FocusPosition = number | "start" | "end";
export type LocationList = List<LocatedBlockId>;
export type Path = LocationList;

export interface IProgress {
  content: IBlockContent;
  locatedChildId: LocatedBlockId;
}

export interface IGraphData {
  // graph stuff
  locatedBlocks: Map<LocatedBlockId, ILocatedBlock>;
  blockContents: Map<BlockContentId, IBlockContent>;

  // editor specific stuff
  // selection related
  activeParentPath: Readonly<Path>;
  selectionRange: Readonly<SelectionRange>;
  isSelectionActive: Readonly<boolean>;
  isSelectionByText: Readonly<boolean>;
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

  // block transitions
  updateBlockText: (blockContentId: BlockContentId, humanText: HumanText) => IGraph;
  updateBlockVerb: (blockContentId: BlockContentId, verb: IVerb) => IGraph;
  removeLocatedBlockFromContent: (content: IBlockContent, locatedBlockId: LocatedBlockId) => IGraph;
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
  toString: () => string;
}

export interface IGraph extends IGraphData, IGraphTransitions, IGraphGetters {}

export function createGraph(graphData: Readonly<IGraphData>): IGraph {
  const transitions: IGraphTransitions = {
    // no-op transition (to cause re-render)
    refresh: () => createGraph(graphData),

    // selection related
    toggleSelectionType: () => {
      return createGraph({
        ...graphData,
        isSelectionByText: !graphData.isSelectionByText,
      });
    },
    setSelectionParent: (): IGraph => {
      // must run after selectionRange is updated
      const { selectionRange } = graphData;
      const maxParentDepth = Math.min(selectionRange.start.size - 1, selectionRange.end.size - 1);
      let parentDepth = 0;
      for (let i = 0; i < maxParentDepth; i++) {
        if (selectionRange.start.get(i) === selectionRange.end.get(i)) {
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
      if (path.size < 1) {
        throw new Error("Can't select root block");
      }
      return createGraph({
        ...graphData,
        selectionRange: { start: path, end: path },
        isSelectionActive: true,
      }).setSelectionParent();
    },
    changeSelection: (path: Path) => {
      if (path.size < 1) {
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
    // recursively remove stuff
    removeLocatedBlockFromContent: (
      content: IBlockContent,
      locatedBlockId: LocatedBlockId
    ): IGraph => {
      // const updatedContent = content.removeLocation(locatedBlockId);
      // if (!updatedContent.hasLocations()) {
      //   const archiveContentAndChildren = (contentToArchive: IBlockContent): {
      //     locatedBlocks: Map<LocatedBlockId, ILocatedBlock>;
      //     blockContents: Map<LocatedBlockId, IBlockContent>;
      //   } => {
      //     let locatedBlocks = Map<LocatedBlockId, ILocatedBlock>();
      //     let blockContents = Map<LocatedBlockId, IBlockContent>();
      //     contentToArchive = contentToArchive.setArchived(true);
      //     blockContents.set(contentToArchive.id, contentToArchive);
      //     contentToArchive.childLocatedBlocks.forEach((childLocatedBlockId) => {
      //       const childLocatedBlock = graphData.locatedBlocks.get(childLocatedBlockId);
      //       const childContent = graphData.blockContents.get(childLocatedBlock.contentId);
      //       locatedBlocks.set(childLocatedBlockId, childLocatedBlock.setArchived(true));
      //       let shouldArchive  = true;
      //       childContent.locatedBlocks.forEach((locatedBlockId) => {
      //         if (!graphData.locatedBlocks.get(locatedBlockId).archived && !locatedBlocks.has(locatedBlockId)) {
      //           shouldArchive = false;
      //         }
      //       });
      //       if (shouldArchive) {
      //         const incoming = archiveContentAndChildren(childContent);
      //         locatedBlocks = locatedBlocks.merge(incoming.locatedBlocks);
      //         blockContents = blockContents.merge(incoming.blockContents);
      //       }
      //     });
      //     return {
      //       locatedBlocks: locatedBlocks,
      //       blockContents: blockContents,
      //     };
      //   }
      //   const { locatedBlocks, blockContents } = archiveContentAndChildren(updatedContent);
      //   const locatedBlockArray = Array.from(locatedBlocks.values());
      //   const blockContentArray = Array.from(blockContents.values());

      // }
      // let updatedBlockContents = graphData.blockContents.set(
      //   updatedContent.id,
      //   updatedContent
      // );
      // if (updatedContent.locatedBlocks.size < 1) {
      //   // if the content we're replacing only has this location,
      //   // let's delete the content from the graph
      //   updatedBlockContents = updatedBlockContents.delete(locatedBlock.contentId);
      // } else {
      //   // otherwise, update the existing content
      //   updatedBlockContents = updatedBlockContents.set(
      //     locatedBlock.contentId,
      //     updatedExistingContent
      //   );
      // }

      return null;
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
      let updatedlocatedBlocks = graphData.locatedBlocks.set(locatedBlockId, updatedLocatedBlock);
      let updatedBlockContents = graphData.blockContents.set(
        updatedNewContent.id,
        updatedNewContent
      );
      if (updatedExistingContent.locatedBlocks.size < 1) {
        // if the content we're replacing only has this location,
        // let's delete the content from the graph
        updatedBlockContents = updatedBlockContents.delete(locatedBlock.contentId);
      } else {
        // otherwise, update the existing content
        updatedBlockContents = updatedBlockContents.set(
          locatedBlock.contentId,
          updatedExistingContent
        );
      }
      return createGraph({
        ...graphData,
        locatedBlocks: updatedlocatedBlocks,
        blockContents: updatedBlockContents,
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
      const newBlockContent = createBlockContent({
        id: newBlockContentId,
        verb,
        humanText,
        userId: "TODO",
        childLocatedBlocks: List(),
        locatedBlocks: List(),
        archived: false,
      });

      // then insert new located block
      return createGraph({
        ...graphData,
        blockContents: graphData.blockContents.set(newBlockContentId, newBlockContent),
      }).insertNewLocatedBlock(leftId, parentContentId, newBlockContentId, locatedBlockId);
    },
    insertNewLocatedBlock: (
      leftId: LocatedBlockId,
      parentContentId: BlockContentId,
      blockContentId: BlockContentId,
      locatedBlockId: LocatedBlockId = crypto.randomUUID()
    ): IGraph => {
      // insert new locatedBlock
      const newLocatedBlock = createLocatedBlock({
        id: locatedBlockId,
        parentId: parentContentId,
        contentId: blockContentId,
        userId: "TODO",
        blockStatus: "not started",
        leftId,
        archived: false,
      });
      const updatedlocatedBlocks = graphData.locatedBlocks.set(locatedBlockId, newLocatedBlock);

      // update its blockContent
      const blockContent = graphData.blockContents.get(blockContentId);
      const updatedBlockContent = blockContent.addLocation(locatedBlockId);
      const updatedBlockContents = graphData.blockContents.set(blockContentId, updatedBlockContent);

      // then update surrounding blocks
      return createGraph({
        ...graphData,
        locatedBlocks: updatedlocatedBlocks,
        blockContents: updatedBlockContents,
      }).addSurroundingBlocks(newLocatedBlock);
    },
    addSurroundingBlocks: (locatedBlock: ILocatedBlock): IGraph => {
      // should remove this from the public interface ^

      // update blockContent parent
      const parentContentId = locatedBlock.parentId;
      const parentContent = graphData.blockContents
        .get(parentContentId)
        .addChildAfter(locatedBlock.leftId, locatedBlock.id);
      const updatedBlockContents = graphData.blockContents.set(parentContent.id, parentContent);

      // update locatedBlock to the right
      let updatedLocatedBlocks = graphData.locatedBlocks;
      const rightLocatedBlockId = parentContent.getRightSiblingIdOf(locatedBlock.id);
      if (rightLocatedBlockId) {
        const rightLocatedBlock = graphData.locatedBlocks.get(rightLocatedBlockId);
        updatedLocatedBlocks = graphData.locatedBlocks.set(
          rightLocatedBlockId,
          rightLocatedBlock.setLeftId(locatedBlock.id)
        );
      }
      return createGraph({
        ...graphData,
        blockContents: updatedBlockContents,
        locatedBlocks: updatedLocatedBlocks,
      });
    },
    removeLocatedBlock: (locatedBlockId: LocatedBlockId): IGraph => {
      const { locatedBlock, blockContent } = fullBlockFromLocatedBlockId(graphData, locatedBlockId);

      // archive locatedBlock
      let updatedlocatedBlocks = graphData.locatedBlocks.set(
        locatedBlockId,
        locatedBlock.setArchived(true)
      );

      // remove location from the associated content
      let updatedBlockContents;
      const updatedBlockContent = blockContent.removeLocation(locatedBlockId);
      if (updatedBlockContent.locatedBlocks.size < 1) {
        // if the content only has this location,
        // let's delete the content from the graph
        updatedBlockContents = graphData.blockContents.delete(blockContent.id);
      } else {
        // otherwise, update the existing content
        updatedBlockContents = graphData.blockContents.set(blockContent.id, updatedBlockContent);
      }

      // update surrounding blocks
      return createGraph({
        ...graphData,
        locatedBlocks: updatedlocatedBlocks,
        blockContents: updatedBlockContents,
      }).removeSurroundingBlocks(locatedBlock);
    },
    removeSurroundingBlocks: (located: ILocatedBlock): IGraph => {
      // should remove this function from the public interface
      const { parentId, leftId } = located;
      const parentContent = graphData.blockContents.get(parentId);

      // update locatedBlock to the right
      let updatedlocatedBlocks = graphData.locatedBlocks;
      const rightLocatedBlockId = parentContent.getRightSiblingIdOf(located.id);
      if (rightLocatedBlockId) {
        const rightLocatedBlock = graphData.locatedBlocks.get(rightLocatedBlockId);
        updatedlocatedBlocks = graphData.locatedBlocks.set(
          rightLocatedBlockId,
          rightLocatedBlock.setLeftId(leftId)
        );
      }

      // update blockContent parent
      const updatedBlockContents = graphData.blockContents.set(
        parentContent.id,
        parentContent.removeChild(located.id)
      );
      return createGraph({
        ...graphData,
        locatedBlocks: updatedlocatedBlocks,
        blockContents: updatedBlockContents,
      });
    },
    moveLocatedBlock: (
      locatedBlockId: LocatedBlockId,
      newLeftId: LocatedBlockId,
      newParentContentId: BlockContentId
    ): IGraph => {
      const located = graphData.locatedBlocks.get(locatedBlockId);
      const updatedLocatedBlock = located.setLeftId(newLeftId).setParentId(newParentContentId);
      const updatedLocatedBlocks = graphData.locatedBlocks.set(locatedBlockId, updatedLocatedBlock);
      return createGraph({ ...graphData, locatedBlocks: updatedLocatedBlocks })
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

  const toString = (): string => {
    const contentsArray = [];
    graphData.blockContents.forEach((content, id) => {
      contentsArray.push(content.toString());
    });
    const locationsArray = [];
    graphData.locatedBlocks.forEach((located, id) => {
      locationsArray.push(located.toString());
    });
    let str = `BlockGraph\n`;
    str += `BlockContents:\n${contentsArray.join("\n")}\n`;
    str += `LocatedBlocks:\n${locationsArray.join("\n")}\n`;
    return str;
  };

  const getters = {
    toString,
  };

  return Object.freeze({
    ...graphData,
    ...transitions,
    ...getters,
  });
}

export const graphToJson = (graph: IGraph): string => {
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

// param graph is an existing graph that contains info not in the json
export const graphFromJson = (json: string, graph: IGraph): IGraph => {
  const parsed = JSON.parse(json);
  let blockContents: Map<BlockContentId, IBlockContent> = Map();
  let locatedBlocks: Map<LocatedBlockId, ILocatedBlock> = Map();
  let blockContentsChildren: Map<BlockContentId, LocatedBlockId[]> = Map();
  parsed.blockContents.forEach(function (val) {
    blockContents = blockContents.set(val.id, contentFromJson(val));
    blockContentsChildren = blockContentsChildren.set(val.id, []);
  });
  parsed.locatedBlocks.forEach(function (val) {
    if (!val.archived) {
      blockContents = blockContents.set(
        val.contentId,
        blockContents.get(val.contentId).addLocation(val.id)
      );
      if (val.parentId) {
        blockContentsChildren.get(val.parentId).push(val.id);
      }
    }
    locatedBlocks = locatedBlocks.set(val.id, locatedBlockFromJson(val));
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
      blockContents = blockContents.set(key, blockContents.get(key).addChildAfter(left, childId));
      left = childId;
      val.splice(val.indexOf(childId), 1);
    }
  });
  const newGraph = createGraph({
    blockContents,
    locatedBlocks,
    activeParentPath: graph.activeParentPath,
    selectionRange: graph.selectionRange,
    isSelectionActive: graph.isSelectionActive,
    isSelectionByText: graph.isSelectionByText,
  });
  return newGraph;
};

export const isChildBetweenSelection = (graph: IGraph, locatedBlockId) => {
  const parentPathLength = graph.activeParentPath.size;
  const bound1 = graph.selectionRange.start.get(parentPathLength);
  const bound2 = graph.selectionRange.end.get(parentPathLength);
  const bound1LocatedBlock = graph.locatedBlocks.get(bound1);
  const parentContent = graph.blockContents.get(bound1LocatedBlock.parentId);
  return parentContent.isChildBetween(locatedBlockId, bound1, bound2);
};
