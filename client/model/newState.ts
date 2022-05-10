// crockford objects for new state
import { nonRootHIndex } from "./state/actionHelpers";
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

  // derived
  rightId: LocatedBlockId;
}

export interface ILocatedBlock extends ILocatedBlockData {}

export function locatedBlock(data: ILocatedBlockData): ILocatedBlock {
  return Object.freeze({
    ...data,
  });
}

// crockford object for BlockContent
export interface IBlockContentData {
  id: BlockContentId;
  blockType: IBlockType;
  humanText: HumanText;
  userId: UserId;

  // derived
  children: LocatedBlockId[];
  parents: LocatedBlockId[];
}

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
      const children = [...blockContentData.children];
      children.splice(index, 0, childId);
      return blockContent({ ...blockContentData, children });
    },
    removeChildAtIndex: (index: number) => {
      const children = [...blockContentData.children];
      children.splice(index, 1);
      return blockContent({ ...blockContentData, children });
    },
    addParentAtIndex: (index: number, parentId: BlockContentId) => {
      const parents = [...blockContentData.parents];
      parents.splice(index, 0, parentId);
      return blockContent({ ...blockContentData, parents });
    },
    removeParentAtIndex: (index: number) => {
      const parents = [...blockContentData.parents];
      parents.splice(index, 1);
      return blockContent({ ...blockContentData, parents });
    },
  };

  return Object.freeze({
    ...blockContentData,
    ...transitions,
  });
}

// crockford object for fullBlock, an auxiliary object that contains both location and content
interface IFullBlockData {
  locatedBlock: ILocatedBlock;
  blockContent: IBlockContent;
}

interface IFullBlockFunctions {
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
      return fullBlockFromLocatedBlockId(stateData, data.blockContent.children[n]);
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
  focusIndex: HierarchyIndex | null;
  focusPosition: FocusPosition;
}

export interface IStateTransitions {
  // no-op transition (to cause re-render)
  refresh: () => IState2;

  // selection related
  startSelection: (hIndex: HierarchyIndex) => IState2;
  changeSelection: (hIndex: HierarchyIndex) => IState2;
  endSelection: () => IState2;

  // block transitions
  insertNewBlock: (at: HierarchyIndex, humanText: HumanText, blockType: IBlockType) => IState2;
  insertNewLocatedBlock: (at: HierarchyIndex, blockContent: IBlockContent) => IState2;
}

export interface IState2 extends IStateData, IStateTransitions {}

export function state(stateData: IStateData): IState2 {
  const helpers = {
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
    startSelection: (hIndex: HierarchyIndex) => {
      hIndex = nonRootHIndex(hIndex);
      const { activeParentId, activeParentIndex } = helpers.getSelectionParent();
      return state({
        ...stateData,
        selectionRange: { start: hIndex, end: hIndex },
        isSelectionActive: true,
        activeParentId,
        activeParentIndex,
        focusIndex: null,
      });
    },
    changeSelection: (hIndex: HierarchyIndex) => {
      hIndex = nonRootHIndex(hIndex);
      const { activeParentId, activeParentIndex } = helpers.getSelectionParent();
      return state({
        ...stateData,
        selectionRange: { start: stateData.selectionRange.start, end: hIndex },
        activeParentId,
        activeParentIndex,
      });
    },
    endSelection: () => {
      return state({
        ...stateData,
        isSelectionActive: false,
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
        children: [],
        parents: [parent.blockContent.id],
      });
      return state({
        ...stateData,
        locatedBlocks: stateData.locatedBlocks.set(newLocatedBlockId, newLocatedBlock),
        blockContents: stateData.blockContents.set(newBlockContentId, newBlockContent),
      });
    },
    insertNewLocatedBlock: (at: HierarchyIndex, blockContentId: BlockContentId): IState2 => {
      const parent = helpers.getFullBlockByHIndex(at.slice(0, -1));
      const newLocatedBlockId = crypto.randomUUID();
      const index = at[at.length - 1];
      const leftId = index > 0 ? parent.blockContent.children[index - 1] : null;
      const rightId = index < parent.blockContent.children.length ? parent.blockContent.children[index] : null;
      const newLocatedBlock = locatedBlock({
        id: newLocatedBlockId,
        parentId: parent.blockContent.id,
        contentId: blockContentId,
        userId: "", // TODO
        blockStatus: "not started",
        leftId,
        rightId,
      });
      const rightLocatedBlock = rightId ? stateData.locatedBlocks.get(rightId): null;
      

    },
    // cursor moves


  };

  return Object.freeze({
    ...stateData,
    ...transitions,
  });
}
