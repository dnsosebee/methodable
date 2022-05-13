// a temp file for initial state
import {
  blockContent,
  BlockContentId,
  IBlockContent,
  IBlockContentData,
  ILocatedBlock,
  ILocatedBlockData,
  IState2,
  locatedBlock,
  LocatedBlockId,
  createState,
} from "../model/newState";
import { blockType, BLOCK_TYPES } from "../model/state/blockType";

const rootLocatedData: ILocatedBlockData = {
  id: "located-root",
  contentId: "content-a",
  userId: "TODO",
  blockStatus: "not started",
  parentId: null,
  leftId: null,
  archived: false,
};
const rootLocated = locatedBlock(rootLocatedData);

const child1LocatedData: ILocatedBlockData = {
  id: "located-child1",
  contentId: "content-b",
  userId: "TODO",
  blockStatus: "not started",
  parentId: "content-a",
  leftId: null,
  archived: false,
};
const child1Located = locatedBlock(child1LocatedData);

const child2LocatedData: ILocatedBlockData = {
  id: "located-child2",
  contentId: "content-c",
  userId: "TODO",
  blockStatus: "not started",
  parentId: "content-a",
  leftId: "located-child1",
  archived: false,
};
const child2Located = locatedBlock(child2LocatedData);

const child3LocatedData: ILocatedBlockData = {
  id: "located-child3",
  contentId: "content-c",
  userId: "TODO",
  blockStatus: "not started",
  parentId: "content-a",
  leftId: "located-child2",
  archived: false,
};
const child3Located = locatedBlock(child3LocatedData);

const contentAData: IBlockContentData = {
  id: "content-a",
  blockType: blockType(BLOCK_TYPES.DO),
  humanText: "Do the following things",
  userId: "TODO",
  childLocatedBlocks: [child1Located.id, child2Located.id, child3Located.id],
  locatedBlocks: [rootLocated.id],
};
const contentA = blockContent(contentAData);

const contentBData: IBlockContentData = {
  id: "content-b",
  blockType: blockType(BLOCK_TYPES.READ),
  humanText: "Read this",
  userId: "TODO",
  childLocatedBlocks: [],
  locatedBlocks: [child1Located.id],
};
const contentB = blockContent(contentBData);

const contentCData: IBlockContentData = {
  id: "content-c",
  blockType: blockType(BLOCK_TYPES.DO),
  humanText: "Do this specific thing",
  userId: "TODO",
  childLocatedBlocks: [],
  locatedBlocks: [child2Located.id, child3Located.id],
};
const contentC = blockContent(contentCData);

export const initialState: IState2 = createState({
  locatedBlocks: new Map<LocatedBlockId, ILocatedBlock>([
    ["located-root", rootLocated],
    ["located-child1", child1Located],
    ["located-child2", child2Located],
    ["located-child3", child3Located],
  ]),
  blockContents: new Map<BlockContentId, IBlockContent>([
    ["content-a", contentA],
    ["content-b", contentB],
    ["content-c", contentC],
  ]),
  locatedIdPath: [rootLocated.id],
  activeParentPath: [],
  selectionRange: { start: [], end: [] },
  isSelectionActive: false,
  isSelectionDeep: true,
  focusPath: null,
  focusPosition: "start",
});
