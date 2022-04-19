
export interface IState {
  // persistent
  blocksMap: Map<BlockId, IBlock>;
  // transient, f(page)
  rootBlockId: BlockId;
  // transient, f(mouse events)
  activeParentId: BlockId;
  activeParentIndex: HierarchyIndex;
  selectionRange: SelectionRange;
  isSelectionActive: boolean;
  isSelectionDeep: boolean;
}

export interface IBlock {
  // persistent
  id: BlockId;
  humanText: HumanText;
  children: BlockId[];
  // transient states, like selectedness and hierarchyIndex, are calculated from state during render
}

export type BlockId = string;
export type HumanText = string;
export type HierarchyIndex = number[];
export type SelectionRange = {start: HierarchyIndex, end: HierarchyIndex};
