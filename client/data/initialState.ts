// a temp file for initial state
import { blockType, BLOCK_TYPES } from "../model/state/blockType";
import { BlockId, IBlock, IState } from "../model/state/stateTypes";

const rootBlock = {
  id: "root",
  humanText: "root",
  children: ["child1", "child2", "child3"],
  parents: [],
  blockType: blockType(BLOCK_TYPES.CHOOSE),
};

const child1 = {
  id: "child1",
  humanText: "child1",
  children: ["child1-1", "child1-2"],
  parents: ["root"],
  blockType: blockType(BLOCK_TYPES.DO)
};

const child2 = {
  id: "child2",
  humanText: "child2",
  children: [],
  parents: ["root"],
  blockType: blockType(BLOCK_TYPES.DO)
};

const child3 = {
  id: "child3",
  humanText: "child3",
  children: ["child_x"],
  parents: ["root"],
  blockType: blockType(BLOCK_TYPES.DO)
};

const child1_1 = {
  id: "child1-1",
  humanText: "child1-1",
  children: [],
  parents: ["child1"],
  blockType: blockType(BLOCK_TYPES.DO)
};

const child1_2 = {
  id: "child1-2",
  humanText: "child1-2",
  children: ["child_x"],
  parents: ["child1"],
  blockType: blockType(BLOCK_TYPES.DO)
};

const child_x = {
  id: "child_x",
  humanText: "child_x",
  children: [],
  parents: ["child3", "child1-2"],
  blockType: blockType(BLOCK_TYPES.DO)
};

export const initialState: IState = {
  blocksMap: new Map<BlockId, IBlock>([
    ["root", rootBlock],
    ["child1", child1],
    ["child2", child2],
    ["child3", child3],
    ["child1-1", child1_1],
    ["child1-2", child1_2],
    ["child_x", child_x],
  ]),
  rootBlockId: "root",
  // selection related
  activeParentId: "root",
  activeParentIndex: [],
  selectionRange: { start: [], end: [] },
  isSelectionActive: false,
  isSelectionDeep: true,
  // focus related
  focusIndex: [],
  focusPosition: 0,
};
