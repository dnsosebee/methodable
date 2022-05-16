// crockford object for state
import { NoSuchBlockError } from "../lib/errors";
import { blockContent, BlockContentId, HumanText, IBlockContent } from "./blockContent";
import { IBlockType } from "./blockType";
import { fullBlockFromLocatedBlockId } from "./fullBlock";
import { ILocatedBlock, locatedBlock, LocatedBlockId } from "./locatedBlock";

// types
export type UserId = string;
export type Path = LocatedBlockId[];
export type SelectionRange = { start: Path; end: Path };
export type FocusPosition = number | "start" | "end";

//actions
export type Action = (state: IState) => IState;

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
  refresh: () => IState;

  // selection related
  setSelectionParent: () => IState;
  startSelection: (path: Path) => IState;
  changeSelection: (path: Path) => IState;
  endSelection: () => IState;

  // focus related
  setFocusLatch: (path: Path, focusPosition: FocusPosition) => IState;
  clearFocusLatch: () => IState;

  // block transitions
  updateBlockText: (blockContentId: BlockContentId, humanText: HumanText) => IState;
  updateBlockType: (blockContentId: BlockContentId, blockType: IBlockType) => IState;
  insertNewBlock: (
    leftId: LocatedBlockId,
    parentContentId,
    humanText: HumanText,
    blockType: IBlockType,
    locatedBlockId?: LocatedBlockId
  ) => IState;
  insertNewLocatedBlock: (
    leftId: LocatedBlockId,
    parentContentId,
    blockContentId: BlockContentId,
    locatedBlockId?: LocatedBlockId
  ) => IState;
  moveLocatedBlock: (
    LocatedBlockId: LocatedBlockId,
    newLeftId: LocatedBlockId,
    newParentContentId: BlockContentId
  ) => IState;
  removeLocatedBlock: (LocatedBlockId: LocatedBlockId) => IState;
  removeSurroundingBlocks: (LocatedBlock: ILocatedBlock) => IState;
  addSurroundingBlocks: (locatedBlock: ILocatedBlock) => IState;
  moveChildren: (leftmostChildId: LocatedBlockId, newParentContentId: BlockContentId) => IState;
}

export interface IStateGetters {
  getUpstairsNeighborPath: (path: Path) => Path;
  getDownstairsNeighborPath: (path: Path) => Path;
}

export interface IState extends IStateData, IStateTransitions, IStateGetters {}

export function createState(stateData: IStateData): IState {
  const transitions: IStateTransitions = {
    // no-op transition (to cause re-render)
    refresh: () => createState(stateData),

    // selection related
    setSelectionParent: (): IState => {
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
    setFocusLatch: (path: Path, focusPosition: FocusPosition): IState => {
      return createState({
        ...stateData,
        focusPath: path,
        focusPosition,
      });
    },
    clearFocusLatch: (): IState => {
      return createState({
        ...stateData,
        focusPath: null,
      });
    },

    // block transitions
    updateBlockText: (blockContentId: BlockContentId, humanText: HumanText): IState => {
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
    updateBlockType: (blockContentId: BlockContentId, blockType: IBlockType): IState => {
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
        userId: "TODO",
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
    ): IState => {
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
      stateData.locatedBlocks.set(locatedBlockId, newLocatedBlock);

      // update blockContent
      const blockContent = stateData.blockContents.get(blockContentId);
      const updatedBlockContent = blockContent.addLocation(locatedBlockId);
      stateData.blockContents.set(blockContentId, updatedBlockContent);

      // then update surrounding blocks
      return createState(stateData).addSurroundingBlocks(newLocatedBlock);
    },
    addSurroundingBlocks: (locatedBlock: ILocatedBlock): IState => {
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
    removeLocatedBlock: (locatedBlockId: LocatedBlockId): IState => {
      const { locatedBlock, blockContent } = fullBlockFromLocatedBlockId(stateData, locatedBlockId);

      // archive locatedBlock
      stateData.locatedBlocks.set(locatedBlockId, locatedBlock.setArchived(true));

      // remove location from the associated content
      const updatedBlockContent = blockContent.removeLocation(locatedBlockId);
      stateData.blockContents.set(blockContent.id, updatedBlockContent);

      // update surrounding blocks
      return createState(stateData).removeSurroundingBlocks(locatedBlock);
    },
    removeSurroundingBlocks: (located: ILocatedBlock): IState => {
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
    ): IState => {
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
    ): IState => {
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
