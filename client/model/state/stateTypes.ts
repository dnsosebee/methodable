export interface IState {
  rootBlock: IBlock;
  selectionRange: SelectionRange;
  isSelectionActive: boolean;
}

export interface IBlock {
  index: HierarchyIndex; // ids of ancestors and self, descending from root
  id: string;
  humanText: string;
  selected: boolean;
  children: IBlock[];
}

export type HierarchyIndex = number[];
export type SelectionRange = {start: HierarchyIndex, end: HierarchyIndex};