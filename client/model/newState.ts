// crockford objects for new state
import { HIndexNotFoundError } from "../lib/errors";
import { getUpstairsNeighborHIndex, nonRootHIndex } from "./state/actionHelpers";
import { IBlockType } from "./state/blockType";

// types
export type BlockStatus = "not started" | "in progress" | "complete" | "archived";
export type BlockContentId = string;
export type LocatedBlockId = string;
export type UserId = string;
export type HumanText = string;
export type HierarchyIndex = number[];
export type SelectionRange = { start: HierarchyIndex; end: HierarchyIndex };
export type FocusPosition = number | "start" | "end";

// crockford object for LocatedBlock
export interface ILocatedBlockData {
  id: LocatedBlockId;
  contentId: BlockContentId;
  userId: string;
  blockStatus: BlockStatus;
  parentId: BlockContentId;
  leftId: LocatedBlockId;
}

interface ILocatedBlockTransitions {
  setLeftId: (leftId: LocatedBlockId) => ILocatedBlock;
}

export interface ILocatedBlock extends ILocatedBlockData, ILocatedBlockTransitions {}

export function locatedBlock(data: ILocatedBlockData): ILocatedBlock {
  const transitions: ILocatedBlockTransitions = {
    setLeftId: (leftId: LocatedBlockId) => {
      return locatedBlock({ ...data, leftId });
    },
  };
  return Object.freeze({
    ...data,
    ...transitions,
  });
}

// crockford object for BlockContent
export interface IBlockContentPersistentData {
  id: BlockContentId;
  blockType: IBlockType;
  humanText: HumanText;
  userId: UserId;
}

export interface IBlockContentAuxiliaryData {
  childLocatedBlocks: LocatedBlockId[];
  parentBlockContents: BlockContentId[];
}

export interface IBlockContentData
  extends IBlockContentPersistentData,
    IBlockContentAuxiliaryData {}

export interface IBlockContentTransitions {
  updateHumanText: (humanText: HumanText) => IBlockContent;
  updateBlockType: (blockType: IBlockType) => IBlockContent;
  addChildAtIndex: (index: number, childId: BlockContentId) => IBlockContent;
  removeChildAtIndex: (index: number) => IBlockContent;
  addParentAtIndex: (index: number, parentId: BlockContentId) => IBlockContent;
  removeParentAtIndex: (index: number) => IBlockContent;
}

export interface IBlockContent extends IBlockContentData, IBlockContentTransitions {}

export function blockContent(blockContentData: IBlockContentData): IBlockContent {
  const transitions: IBlockContentTransitions = {
    updateHumanText: (humanText: HumanText) => {
      return blockContent({ ...blockContentData, humanText });
    },
    updateBlockType: (blockType: IBlockType) => {
      return blockContent({ ...blockContentData, blockType });
    },
    addChildAtIndex: (index: number, childId: BlockContentId) => {
      const children = [...blockContentData.childLocatedBlocks];
      children.splice(index, 0, childId);
      return blockContent({ ...blockContentData, childLocatedBlocks: children });
    },
    removeChildAtIndex: (index: number) => {
      const children = [...blockContentData.childLocatedBlocks];
      children.splice(index, 1);
      return blockContent({ ...blockContentData, childLocatedBlocks: children });
    },
    addParentAtIndex: (index: number, parentId: BlockContentId) => {
      const parents = [...blockContentData.parentBlockContents];
      parents.splice(index, 0, parentId);
      return blockContent({ ...blockContentData, parentBlockContents: parents });
    },
    removeParentAtIndex: (index: number) => {
      const parents = [...blockContentData.parentBlockContents];
      parents.splice(index, 1);
      return blockContent({ ...blockContentData, parentBlockContents: parents });
    },
  };

  return Object.freeze({
    ...blockContentData,
    ...transitions,
  });
}

// crockford object for fullBlock, an auxiliary object that contains both location and content
export interface IFullBlockData {
  locatedBlock: ILocatedBlock;
  blockContent: IBlockContent;
}

export interface IFullBlockFunctions {
  getParent: () => IFullBlock | null;
  getNthChild: (n: number) => IFullBlock | null;
}

interface IFullBlock extends IFullBlockData, IFullBlockFunctions {}

function fullBlockFromLocatedBlockId(
  stateData: IStateData,
  locatedBlockId: LocatedBlockId
): IFullBlock {
  const locatedBlock = stateData.locatedBlocks.get(locatedBlockId);
  const blockContent = stateData.blockContents.get(locatedBlock.contentId);
  return fullBlock(stateData, { locatedBlock, blockContent });
}

export function fullBlock(stateData: IStateData, data: IFullBlockData): IFullBlock {
  const functions = {
    getParent: () => {
      const parentId = data.locatedBlock.parentId;
      if (!parentId) {
        return null;
      }
      return fullBlockFromLocatedBlockId(stateData, parentId);
    },
    getNthChild: (n: number) => {
      return fullBlockFromLocatedBlockId(stateData, data.blockContent.childLocatedBlocks[n]);
    },
  };
  return Object.freeze({
    ...data,
    ...functions,
  });
}

// crockford object for state
export interface IStateData {
  // persistent
  locatedBlocks: Map<LocatedBlockId, ILocatedBlock>;
  blockContents: Map<BlockContentId, IBlockContent>;
  // transient, f(page)
  locatedIdPath: LocatedBlockId[];
  // deprecated
  rootLocatedBlockId: LocatedBlockId; // this is kinda confusing, but this is the block in focus from which all others branch
  // selection related
  activeParentId: BlockContentId;
  activeParentIndex: HierarchyIndex; // or should this be a path?
  selectionRange: SelectionRange; // or should this be paths?
  isSelectionActive: boolean;
  isSelectionDeep: boolean;
  // focus related
  focusLocatedBlockId: LocatedBlockId | null;
  focusPosition: FocusPosition;
}

export interface IStateTransitions {
  // no-op transition (to cause re-render)
  refresh: () => IState2;

  // selection related
  setSelectionParent: () => IState2;
  startSelection: (hIndex: HierarchyIndex) => IState2;
  changeSelection: (hIndex: HierarchyIndex) => IState2;
  endSelection: () => IState2;

  // focus related
  setFocusLatch: (locatedBlockId: LocatedBlockId, focusPosition: FocusPosition) => IState2;
  clearFocusLatch: () => IState2;

  // block transitions
  insertNewBlock: (at: HierarchyIndex, humanText: HumanText, blockType: IBlockType) => IState2;
  insertNewLocatedBlock: (at: HierarchyIndex, blockContentId: BlockContentId) => IState2;
}

export interface IStateGetters {
  getUpstairsNeighbor: (hIndex: HierarchyIndex) => LocatedBlockId;
  getDownstairsNeighbor: (hIndex: HierarchyIndex) => LocatedBlockId;
}

export interface IState2 extends IStateData, IStateTransitions, IStateGetters {}

export function state(stateData: IStateData): IState2 {
  const helpers = {
    getFullBlockByHIndex: (hIndex: HierarchyIndex): IFullBlock => {
      let parent = fullBlockFromLocatedBlockId(stateData, stateData.rootLocatedBlockId);
      for (let i = 0; i < hIndex.length; i++) {
        const childNumber = hIndex[i];
        parent = parent.getNthChild(childNumber);
      }
      return parent;
    },
  };

  const transitions: IStateTransitions = {
    // no-op transition (to cause re-render)
    refresh: () => state(stateData),

    // selection related
    setSelectionParent: (): IState2 => {
      // must run after selectionRange is updated
      const { rootLocatedBlockId, selectionRange } = stateData;
      let parent = fullBlockFromLocatedBlockId(stateData, rootLocatedBlockId);
      let activeParentHIndex: HierarchyIndex = [];
      const maxParentDepth = Math.min(
        selectionRange.start.length - 1,
        selectionRange.end.length - 1
      );
      for (let i = 0; i < maxParentDepth; i++) {
        if (selectionRange.start[i] === selectionRange.end[i]) {
          const childNumber = selectionRange.start[i];
          parent = parent.getNthChild(childNumber);
          activeParentHIndex.push(childNumber);
        }
      }
      return state({
        ...stateData,
        activeParentId: parent.blockContent.id,
        activeParentIndex: activeParentHIndex,
      });
    },
    startSelection: (hIndex: HierarchyIndex) => {
      hIndex = nonRootHIndex(hIndex);
      return state({
        ...stateData,
        selectionRange: { start: hIndex, end: hIndex },
        isSelectionActive: true,
        focusLocatedBlockId: null,
      }).setSelectionParent();
    },
    changeSelection: (hIndex: HierarchyIndex) => {
      hIndex = nonRootHIndex(hIndex);
      return state({
        ...stateData,
        selectionRange: { start: stateData.selectionRange.start, end: hIndex },
      }).setSelectionParent();
    },
    endSelection: () => {
      return state({
        ...stateData,
        isSelectionActive: false,
      });
    },

    // cursor moves
    setFocusLatch: (locatedBlockId: LocatedBlockId, focusPosition: FocusPosition): IState2 => {
      return state({
        ...stateData,
        focusLocatedBlockId: locatedBlockId,
        focusPosition,
      });
    },
    clearFocusLatch: (): IState2 => {
      return state({
        ...stateData,
        focusLocatedBlockId: null,
      });
    },

    // block transitions
    insertNewBlock: (at: HierarchyIndex, humanText: HumanText, blockType: IBlockType) => {
      const parent = helpers.getFullBlockByHIndex(at.slice(0, -1));
      const newBlockContentId = crypto.randomUUID();
      const newBlockContent = blockContent({
        id: newBlockContentId,
        blockType,
        humanText,
        userId: "", // TODO
        childLocatedBlocks: [],
        parentBlockContents: [parent.blockContent.id],
      });
      stateData.blockContents.set(newBlockContentId, newBlockContent);

      return state({
        ...stateData,
      }).insertNewLocatedBlock(at, newBlockContentId);
    },
    insertNewLocatedBlock: (at: HierarchyIndex, blockContentId: BlockContentId): IState2 => {
      const parent = helpers.getFullBlockByHIndex(at.slice(0, -1));
      const newLocatedBlockId = crypto.randomUUID();
      const index = at[at.length - 1];
      const leftId = index > 0 ? parent.blockContent.childLocatedBlocks[index - 1] : null;

      // insert new locatedBlock
      const newLocatedBlock = locatedBlock({
        id: newLocatedBlockId,
        parentId: parent.blockContent.id,
        contentId: blockContentId,
        userId: "", // TODO
        blockStatus: "not started",
        leftId,
      });
      stateData.locatedBlocks.set(newLocatedBlockId, newLocatedBlock);

      // update locatedBlock to the right
      const rightId =
        index < parent.blockContent.childLocatedBlocks.length
          ? parent.blockContent.childLocatedBlocks[index]
          : null;
      const rightLocatedBlock = rightId ? stateData.locatedBlocks.get(rightId) : null;
      if (rightLocatedBlock) {
        stateData.locatedBlocks.set(rightId, rightLocatedBlock.setLeftId(newLocatedBlockId));
      }

      // update blockContent parent
      stateData.blockContents.set(
        parent.blockContent.id,
        parent.blockContent.addChildAtIndex(index, newLocatedBlockId)
      );

      return state({
        ...stateData,
      });
    },
  };

  const getters = {
    getUpstairsNeighbor: (hIndex: HierarchyIndex): LocatedBlockId => {
      if (hIndex.length === 0) {
        throw new HIndexNotFoundError();
      }
      const fullBlock = helpers.getFullBlockByHIndex(hIndex);
      if (hIndex[hIndex.length - 1] === 0) {
        return fullBlock.getParent().locatedBlock.id;
      }
      const parent = fullBlock.getParent();
      let youngerSibling = parent.getNthChild(hIndex[hIndex.length - 1] - 1);

      // get lowest descendant of youngerSibling
      let youngerSiblingNumChildren = youngerSibling.blockContent.childLocatedBlocks.length;
      while (youngerSiblingNumChildren > 0) {
        youngerSibling = youngerSibling.getNthChild(youngerSiblingNumChildren - 1);
        youngerSiblingNumChildren = youngerSibling.blockContent.childLocatedBlocks.length;
      }
      return youngerSibling.locatedBlock.id;
    },
    getDownstairsNeighbor: (hIndex: HierarchyIndex): LocatedBlockId => {
      
    },
  };

  return Object.freeze({
    ...stateData,
    ...transitions,
    ...getters,
  });
}
