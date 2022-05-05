import { IBlockType } from "./blockType";

// The main application state
export interface IState {
  // persistent
  blocksMap: Map<BlockId, IBlock>;
  // transient, f(page)
  idPath: BlockId[];
  rootBlockId: BlockId; // this is kinda confusing, but this is the block in focus from which all others branch
  // transient, f(mouse events, keyboard events)
  // selection related
  activeParentId: BlockId;
  activeParentIndex: HierarchyIndex;
  selectionRange: SelectionRange;
  isSelectionActive: boolean;
  isSelectionDeep: boolean;
  // focus related
  focusIndex: HierarchyIndex | null;
  focusPosition: FocusPosition;
}

export interface IBlock {
  // persistent
  id: BlockId;
  humanText: HumanText;
  children: BlockId[];
  parents: BlockId[];
  blockType: IBlockType;
  // transient states, like selectedness and hierarchyIndex, are calculated from state during render
}

export type BlockId = string;
export type HumanText = string;
export type HierarchyIndex = number[];
export type SelectionRange = { start: HierarchyIndex; end: HierarchyIndex };
export type FocusPosition = number | "start" | "end";
