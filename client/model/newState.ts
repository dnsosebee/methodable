// crockford objects for new state
import { NoSuchBlockError } from "../lib/errors";
import { IBlockType } from "./state/blockType";

// types
export type BlockStatus = "not started" | "in progress" | "complete";
export type BlockContentId = string;
export type LocatedBlockId = string;
export type UserId = string;
export type HumanText = string;
export type Path = LocatedBlockId[];
export type SelectionRange = { start: Path; end: Path };
export type FocusPosition = number | "start" | "end";

// crockford object for LocatedBlock
export interface ILocatedBlockData {
  id: LocatedBlockId;
  contentId: BlockContentId;
  userId: string;
  blockStatus: BlockStatus;
  parentId: BlockContentId;
  leftId: LocatedBlockId;
  archived: boolean;
}

interface ILocatedBlockTransitions {
  setLeftId: (leftId: LocatedBlockId) => ILocatedBlock;
  setParentId: (parentId: BlockContentId) => ILocatedBlock;
  setArchived: (archived: boolean) => ILocatedBlock;
}

export interface ILocatedBlock extends ILocatedBlockData, ILocatedBlockTransitions {}

export function locatedBlock(data: ILocatedBlockData): ILocatedBlock {
  const transitions: ILocatedBlockTransitions = {
    setLeftId: (leftId: LocatedBlockId) => {
      return locatedBlock({ ...data, leftId });
    },
    setParentId: (parentId: BlockContentId) => {
      return locatedBlock({ ...data, parentId });
    },
    setArchived: (archived: boolean) => {
      return locatedBlock({ ...data, archived });
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
  locatedBlocks: LocatedBlockId[];
}

export interface IBlockContentData
  extends IBlockContentPersistentData,
    IBlockContentAuxiliaryData {}

export interface IBlockContentTransitions {
  updateHumanText: (humanText: HumanText) => IBlockContent;
  updateBlockType: (blockType: IBlockType) => IBlockContent;
  addChildAfter: (leftId: LocatedBlockId, newId: LocatedBlockId) => IBlockContent;
  removeChild: (id: LocatedBlockId) => IBlockContent;
  addLocation: (id: LocatedBlockId) => IBlockContent;
  removeLocation: (id: LocatedBlockId) => IBlockContent;
}

export interface IBlockContentGetters {
  getRightSiblingIdOf: (ofId: LocatedBlockId) => LocatedBlockId;
  getLeftSiblingIdOf: (ofId: LocatedBlockId) => LocatedBlockId;
  getLeftmostChildId: () => LocatedBlockId;
  getRightmostChildId: () => LocatedBlockId;
  hasChildren: () => boolean;
  hasLocations: () => boolean;
  isChildBetween: (
    childId: LocatedBlockId,
    bound1: LocatedBlockId,
    bound2: LocatedBlockId
  ) => boolean;
}

export interface IBlockContent
  extends IBlockContentData,
    IBlockContentTransitions,
    IBlockContentGetters {}

export function blockContent(blockContentData: IBlockContentData): IBlockContent {
  const transitions: IBlockContentTransitions = {
    updateHumanText: (humanText: HumanText) => {
      const newData = { ...blockContentData, humanText };
      return blockContent(newData);
    },
    updateBlockType: (blockType: IBlockType) => {
      return blockContent({ ...blockContentData, blockType });
    },
    addChildAfter: (leftId: LocatedBlockId, newId: LocatedBlockId) => {
      const leftIndex = blockContentData.childLocatedBlocks.indexOf(leftId);
      blockContentData.childLocatedBlocks.splice(leftIndex + 1, 0, newId);
      return blockContent(blockContentData);
    },
    removeChild: (id: LocatedBlockId) => {
      const index = blockContentData.childLocatedBlocks.indexOf(id);
      if (index === -1) {
        throw new Error("Child not found");
      }
      blockContentData.childLocatedBlocks.splice(index, 1);
      return blockContent(blockContentData);
    },
    addLocation: (id: LocatedBlockId) => {
      blockContentData.locatedBlocks.push(id);
      return blockContent(blockContentData);
    },
    removeLocation: (id: LocatedBlockId) => {
      const index = blockContentData.locatedBlocks.indexOf(id);
      if (index === -1) {
        throw new Error("Parent not found");
      }
      blockContentData.locatedBlocks.splice(index, 1);
      return blockContent(blockContentData);
    },
  };

  const getters = {
    getRightSiblingIdOf: (ofId: LocatedBlockId) => {
      const leftIndex = blockContentData.childLocatedBlocks.indexOf(ofId);
      if (leftIndex === -1) {
        throw new Error("Child not found");
      }
      if (leftIndex === blockContentData.childLocatedBlocks.length - 1) {
        return null;
      }
      return blockContentData.childLocatedBlocks[leftIndex + 1];
    },
    getLeftSiblingIdOf: (ofId: LocatedBlockId) => {
      const rightIndex = blockContentData.childLocatedBlocks.indexOf(ofId);
      if (rightIndex === -1) {
        throw new Error("Child not found: " + ofId);
      }
      if (rightIndex === 0) {
        return null;
      }
      return blockContentData.childLocatedBlocks[rightIndex - 1];
    },
    getLeftmostChildId: () => {
      if (blockContentData.childLocatedBlocks.length === 0) {
        return null;
      }
      return blockContentData.childLocatedBlocks[0];
    },
    getRightmostChildId: () => {
      if (blockContentData.childLocatedBlocks.length === 0) {
        return null;
      }
      return blockContentData.childLocatedBlocks[blockContentData.childLocatedBlocks.length - 1];
    },
    hasChildren: () => {
      return blockContentData.childLocatedBlocks.length > 0;
    },
    hasLocations: () => {
      return blockContentData.locatedBlocks.length > 0;
    },
    isChildBetween: (childId: LocatedBlockId, bound1: LocatedBlockId, bound2: LocatedBlockId) => {
      const childIndex = blockContentData.childLocatedBlocks.indexOf(childId);
      if (childIndex === -1) {
        throw new Error("Child not found");
      }
      const bound1Index = blockContentData.childLocatedBlocks.indexOf(bound1);
      if (bound1Index === -1) {
        throw new Error("Bound 1 not found");
      }
      const bound2Index = blockContentData.childLocatedBlocks.indexOf(bound2);
      if (bound2Index === -1) {
        throw new Error("Bound 2 not found");
      }
      return (
        (childIndex >= bound1Index && childIndex <= bound2Index) ||
        (childIndex <= bound1Index && childIndex >= bound2Index)
      );
    },
  };

  return Object.freeze({
    ...blockContentData,
    ...transitions,
    ...getters,
  });
}

// crockford object for fullBlock, an auxiliary object that contains both location and content
export interface IFullBlockData {
  locatedBlock: ILocatedBlock;
  blockContent: IBlockContent;
}

export interface IFullBlockFunctions {
  // getParent: () => IFullBlock | null;
}

export interface IFullBlock extends IFullBlockData, IFullBlockFunctions {}

export function fullBlockFromLocatedBlockId(
  stateData: IStateData,
  locatedBlockId: LocatedBlockId
): IFullBlock {
  const locatedBlock = stateData.locatedBlocks.get(locatedBlockId);
  const blockContent = stateData.blockContents.get(locatedBlock.contentId);
  return fullBlock(stateData, { locatedBlock, blockContent });
}

export function fullBlock(stateData: IStateData, data: IFullBlockData): IFullBlock {
  const functions = {
    // getParent: () => {
    //   const parentContentId = data.locatedBlock.parentId;
    //   if (!parentContentId) {
    //     return null;
    //   }
    //   return fullBlockFromLocatedBlockId(stateData, parentContentId);
    // },
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
  locatedIdPath: Path;
  // selection related
  activeParentPath: Path;
  selectionRange: SelectionRange;
  isSelectionActive: boolean;
  isSelectionDeep: boolean;
  // focus related
  focusPath: Path | null;
  focusPosition: FocusPosition;
}

export interface IStateTransitions {
  // no-op transition (to cause re-render)
  refresh: () => IState2;

  // selection related
  setSelectionParent: () => IState2;
  startSelection: (path: Path) => IState2;
  changeSelection: (path: Path) => IState2;
  endSelection: () => IState2;

  // focus related
  setFocusLatch: (path: Path, focusPosition: FocusPosition) => IState2;
  clearFocusLatch: () => IState2;

  // block transitions
  updateBlockText: (blockContentId: BlockContentId, humanText: HumanText) => IState2;
  updateBlockType: (blockContentId: BlockContentId, blockType: IBlockType) => IState2;
  insertNewBlock: (
    leftId: LocatedBlockId,
    parentContentId,
    humanText: HumanText,
    blockType: IBlockType,
    locatedBlockId?: LocatedBlockId
  ) => IState2;
  insertNewLocatedBlock: (
    leftId: LocatedBlockId,
    parentContentId,
    blockContentId: BlockContentId,
    locatedBlockId?: LocatedBlockId
  ) => IState2;
  moveLocatedBlock: (
    LocatedBlockId: LocatedBlockId,
    newLeftId: LocatedBlockId,
    newParentContentId: BlockContentId
  ) => IState2;
  removeLocatedBlock: (LocatedBlockId: LocatedBlockId) => IState2;
  removeSurroundingBlocks: (LocatedBlock: ILocatedBlock) => IState2;
  addSurroundingBlocks: (locatedBlock: ILocatedBlock) => IState2;
  moveChildren: (leftmostChildId: LocatedBlockId, newParentContentId: BlockContentId) => IState2;
}

export interface IStateGetters {
  getUpstairsNeighborPath: (path: Path) => Path;
  getDownstairsNeighborPath: (path: Path) => Path;
}

export interface IState2 extends IStateData, IStateTransitions, IStateGetters {}

export function createState(stateData: IStateData): IState2 {
  const helpers = {
    // TODO delete this
  };

  const transitions: IStateTransitions = {
    // no-op transition (to cause re-render)
    refresh: () => createState(stateData),

    // selection related
    setSelectionParent: (): IState2 => {
      // must run after selectionRange is updated
      const { selectionRange } = stateData;
      const maxParentDepth = Math.min(
        selectionRange.start.length - 1,
        selectionRange.end.length - 1
      );
      let parentDepth = 1;
      for (let i = 1; i < maxParentDepth; i++) {
        if (selectionRange.start[i] === selectionRange.end[i]) {
          parentDepth += 1;
        } else {
          break;
        }
      }
      return createState({
        ...stateData,
        activeParentPath: selectionRange.start.slice(0, parentDepth),
      });
    },
    startSelection: (path: Path) => {
      if (path.length < 2) {
        throw new Error("Can't select root block");
      }
      return createState({
        ...stateData,
        selectionRange: { start: path, end: path },
        isSelectionActive: true,
        focusPath: null,
      }).setSelectionParent();
    },
    changeSelection: (path: Path) => {
      if (path.length < 2) {
        throw new Error("Can't select root block");
      }
      return createState({
        ...stateData,
        selectionRange: { start: stateData.selectionRange.start, end: path },
      }).setSelectionParent();
    },
    endSelection: () => {
      return createState({
        ...stateData,
        isSelectionActive: false,
      });
    },

    // cursor moves
    setFocusLatch: (path: Path, focusPosition: FocusPosition): IState2 => {
      return createState({
        ...stateData,
        focusPath: path,
        focusPosition,
      });
    },
    clearFocusLatch: (): IState2 => {
      return createState({
        ...stateData,
        focusPath: null,
      });
    },

    // block transitions
    updateBlockText: (blockContentId: BlockContentId, humanText: HumanText): IState2 => {
      const blockContent = stateData.blockContents.get(blockContentId);
      if (!blockContent) {
        throw new Error(`blockContentId ${blockContentId} not found`);
      }
      return createState({
        ...stateData,
        blockContents: stateData.blockContents.set(
          blockContentId,
          blockContent.updateHumanText(humanText)
        ),
      });
    },
    updateBlockType: (blockContentId: BlockContentId, blockType: IBlockType): IState2 => {
      const blockContent = stateData.blockContents.get(blockContentId);
      if (!blockContent) {
        throw new Error(`blockContentId ${blockContentId} not found`);
      }
      return createState({
        ...stateData,
        blockContents: stateData.blockContents.set(
          blockContentId,
          blockContent.updateBlockType(blockType)
        ),
      });
    },
    insertNewBlock: (
      leftId: LocatedBlockId,
      parentContentId: BlockContentId,
      humanText: HumanText,
      blockType: IBlockType,
      locatedBlockId: LocatedBlockId = crypto.randomUUID()
    ) => {
      // insert new block content
      const newBlockContentId = crypto.randomUUID();
      const newBlockContent = blockContent({
        id: newBlockContentId,
        blockType,
        humanText,
        userId: "", // TODO
        childLocatedBlocks: [],
        locatedBlocks: [],
      });
      stateData.blockContents.set(newBlockContentId, newBlockContent);

      // then insert new located block
      return createState(stateData).insertNewLocatedBlock(
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
    ): IState2 => {
      // insert new locatedBlock
      const newLocatedBlock = locatedBlock({
        id: locatedBlockId,
        parentId: parentContentId,
        contentId: blockContentId,
        userId: "", // TODO
        blockStatus: "not started",
        leftId,
        archived: false,
      });
      stateData.locatedBlocks.set(locatedBlockId, newLocatedBlock);

      // update blockContent
      const blockContent = stateData.blockContents.get(blockContentId);
      const updatedBlockContent = blockContent.addLocation(locatedBlockId);
      stateData.blockContents.set(blockContentId, updatedBlockContent);

      // then update surrounding blocks
      return createState(stateData).addSurroundingBlocks(newLocatedBlock);
    },
    addSurroundingBlocks: (locatedBlock: ILocatedBlock): IState2 => {
      // should remove this from the public interface

      // update blockContent parent
      const parentContentId = locatedBlock.parentId;
      const parentContent = stateData.blockContents.get(parentContentId);
      stateData.blockContents.set(
        parentContent.id,
        parentContent.addChildAfter(locatedBlock.leftId, locatedBlock.id)
      );

      // update locatedBlock to the right
      const rightLocatedBlockId = parentContent.getRightSiblingIdOf(locatedBlock.id);
      if (rightLocatedBlockId) {
        const rightLocatedBlock = stateData.locatedBlocks.get(rightLocatedBlockId);
        stateData.locatedBlocks.set(
          rightLocatedBlockId,
          rightLocatedBlock.setLeftId(locatedBlock.id)
        );
      }
      return createState(stateData);
    },
    removeLocatedBlock: (locatedBlockId: LocatedBlockId): IState2 => {
      const { locatedBlock, blockContent } = fullBlockFromLocatedBlockId(stateData, locatedBlockId);

      // archive locatedBlock
      stateData.locatedBlocks.set(locatedBlockId, locatedBlock.setArchived(true));

      // remove location from the associated content
      const updatedBlockContent = blockContent.removeLocation(locatedBlockId);
      stateData.blockContents.set(blockContent.id, updatedBlockContent);

      // update surrounding blocks
      return createState(stateData).removeSurroundingBlocks(locatedBlock);
    },
    removeSurroundingBlocks: (located: ILocatedBlock): IState2 => {
      // should remove this from the public interface
      const { parentId, leftId } = located;
      const parentContent = stateData.blockContents.get(parentId);

      // update locatedBlock to the right
      const rightLocatedBlockId = parentContent.getRightSiblingIdOf(located.id);
      if (rightLocatedBlockId) {
        const rightLocatedBlock = stateData.locatedBlocks.get(rightLocatedBlockId);
        stateData.locatedBlocks.set(rightLocatedBlockId, rightLocatedBlock.setLeftId(leftId));
      }

      // update blockContent parent
      stateData.blockContents.set(parentContent.id, parentContent.removeChild(located.id));
      return createState(stateData);
    },
    moveLocatedBlock: (
      locatedBlockId: LocatedBlockId,
      newLeftId: LocatedBlockId,
      newParentContentId: BlockContentId
    ): IState2 => {
      const located = stateData.locatedBlocks.get(locatedBlockId);
      const updatedLocatedBlock = located.setLeftId(newLeftId).setParentId(newParentContentId);
      stateData.locatedBlocks.set(locatedBlockId, updatedLocatedBlock);
      return createState(stateData)
        .removeSurroundingBlocks(located)
        .addSurroundingBlocks(updatedLocatedBlock);
    },
    // moves children starting at leftmostChildLocatedId to the end of newParentContent's children
    // could be optimized
    moveChildren: (
      leftmostChildLocatedId: LocatedBlockId,
      newParentContentId: BlockContentId
    ): IState2 => {
      if (!leftmostChildLocatedId) {
        // base case
        return createState(stateData);
      }
      // old parent
      const leftmostChildLocated = stateData.locatedBlocks.get(leftmostChildLocatedId);
      const oldParentContent = stateData.blockContents.get(leftmostChildLocated.parentId);
      const nextLeftmostChildId = oldParentContent.getRightSiblingIdOf(leftmostChildLocatedId);

      // new parent
      const newParentContent = stateData.blockContents.get(newParentContentId);
      const newParentRightmostChildId = newParentContent.getRightmostChildId();

      return createState(stateData)
        .moveLocatedBlock(leftmostChildLocatedId, newParentRightmostChildId, newParentContentId)
        .moveChildren(nextLeftmostChildId, newParentContentId);
    },
  };

  const getters = {
    getUpstairsNeighborPath: (path: Path): Path => {
      if (path.length < 2) {
        // root block has no upstairs neighbor
        throw new NoSuchBlockError();
      }
      const locatedBlockId = path[path.length - 1];
      const locatedBlock = stateData.locatedBlocks.get(locatedBlockId);
      const parentBlockContent = stateData.blockContents.get(locatedBlock.parentId);
      if (parentBlockContent.getLeftmostChildId() === locatedBlock.id) {
        return path.slice(0, -1);
      }
      let upstairsNeighborId = parentBlockContent.getLeftSiblingIdOf(locatedBlockId);
      let upstairsNeighborPath = [...path.slice(0, -1), upstairsNeighborId];
      let upstairsNeighbor = fullBlockFromLocatedBlockId(stateData, upstairsNeighborId);
      while (upstairsNeighbor.blockContent.hasChildren()) {
        upstairsNeighborId = upstairsNeighbor.blockContent.getRightmostChildId();
        upstairsNeighbor = fullBlockFromLocatedBlockId(stateData, upstairsNeighborId);
        upstairsNeighborPath.push(upstairsNeighborId);
      }
      return upstairsNeighborPath;
    },
    getDownstairsNeighborPath: (path: Path): Path => {
      const locatedBlockId = path[path.length - 1];
      const block = fullBlockFromLocatedBlockId(stateData, locatedBlockId);
      if (block.blockContent.hasChildren()) {
        // if current block has children, downstairs neighbor is the first child
        return [...path, block.blockContent.getLeftmostChildId()];
      }
      let youngerAncestorId = locatedBlockId;
      for (let i = path.length - 2; i >= 0; i--) {
        const ancestorId = path[i];
        const ancestorPath = path.slice(0, i + 1);
        const ancestor = fullBlockFromLocatedBlockId(stateData, ancestorId);
        const rightmostChildId = ancestor.blockContent.getRightmostChildId();
        if (rightmostChildId !== youngerAncestorId) {
          // then we've found the point where there's a younger sibling (the downstairs neighbor)
          return [...ancestorPath, ancestor.blockContent.getRightSiblingIdOf(youngerAncestorId)];
        }
        youngerAncestorId = ancestorId;
      }
      throw new NoSuchBlockError();
    },
  };

  return Object.freeze({
    ...stateData,
    ...transitions,
    ...getters,
  });
}
