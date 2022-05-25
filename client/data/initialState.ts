// a temp file for initial state
import { IState, createState } from "../model/state";
import { blockType, BLOCK_TYPES } from "../model/blockType";
import {
  ILocatedBlock,
  ILocatedBlockData,
  locatedBlock,
  LocatedBlockId,
} from "../model/locatedBlock";
import {
  blockContent,
  BlockContentId,
  IBlockContent,
  IBlockContentData,
} from "../model/blockContent";

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

const contentAData: IBlockContentData = {
  id: "content-a",
  blockType: blockType(BLOCK_TYPES.DO),
  humanText: "Do the following things",
  userId: "TODO",
  childLocatedBlocks: [child1Located.id, child2Located.id],
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
  locatedBlocks: [child2Located.id],
};
const contentC = blockContent(contentCData);

export const initialState: IState = createState({
  locatedBlocks: new Map<LocatedBlockId, ILocatedBlock>([
    ["located-root", rootLocated],
    ["located-child1", child1Located],
    ["located-child2", child2Located],
  ]),
  blockContents: new Map<BlockContentId, IBlockContent>([
    ["content-a", contentA],
    ["content-b", contentB],
    ["content-c", contentC],
  ]),
  rootContentId: "content-a",
  rootRelativePath: [],
  activeParentPath: [],
  selectionRange: { start: [], end: [] },
  isSelectionActive: false,
  isSelectionDeep: true,
  focusPath: null,
  focusPosition: "start",
  isFocusSpecifiedInURL: false,
});
