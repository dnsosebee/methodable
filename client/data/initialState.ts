// a temp file for initial state
import { BlockId, IBlock, IState } from "../model/state/stateTypes";

const rootBlock = {
  id: "root",
  humanText: "root",
  children: ["child1", "child2", "child3"],
};

const child1 = {
  id: "child1",
  humanText: "child1",
  children: ["child1-1", "child1-2"],
};

const child2 = {
  id: "child2",
  humanText: "child2",
  children: [],
};

const child3 = {
  id: "child3",
  humanText: "child3",
  children: ["child_x"],
};

const child1_1 = {
  id: "child1-1",
  humanText: "child1-1",
  children: [],
};

const child1_2 = {
  id: "child1-2",
  humanText: "child1-2",
  children: ["child_x"],
};

const child_x = {
  id: "child_x",
  humanText: "child_x",
  children: [],
};

export const initialState: IState = {
  rootBlockId: "root",
  blocksMap: new Map<BlockId, IBlock>([
    ["root", rootBlock],
    ["child1", child1],
    ["child2", child2],
    ["child3", child3],
    ["child1-1", child1_1],
    ["child1-2", child1_2],
    ["child_x", child_x],
  ]),
  activeParentId: "root",
  activeParentIndex: [],
  selectionRange: { start: [], end: [] },
  isSelectionActive: false,
  isSelectionDeep: true,
};
