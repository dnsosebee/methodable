// a temp file for initial state
import { IGraph, createGraph } from "../model/graph";
import {
  ILocatedBlock,
  ILocatedBlockData,
  createLocatedBlock,
  LocatedBlockId,
} from "../model/locatedBlock";
import {
  createBlockContent,
  BlockContentId,
  IBlockContent,
  IBlockContentData,
} from "../model/blockContent";
import { VERB, verb } from "../model/verbs/verb";
import { List, Map } from "immutable";

const rootLocatedData: ILocatedBlockData = {
  id: "located-root",
  contentId: "content-a",
  userId: "TODO",
  blockStatus: "not started",
  parentId: null,
  leftId: null,
  archived: false,
};
const rootLocated = createLocatedBlock(rootLocatedData);

const child1LocatedData: ILocatedBlockData = {
  id: "located-child1",
  contentId: "content-b",
  userId: "TODO",
  blockStatus: "not started",
  parentId: "content-a",
  leftId: null,
  archived: false,
};
const child1Located = createLocatedBlock(child1LocatedData);

const child2LocatedData: ILocatedBlockData = {
  id: "located-child2",
  contentId: "content-c",
  userId: "TODO",
  blockStatus: "not started",
  parentId: "content-a",
  leftId: "located-child1",
  archived: false,
};
const child2Located = createLocatedBlock(child2LocatedData);

const child3LocatedData: ILocatedBlockData = {
  id: "located-child3",
  contentId: "content-c",
  userId: "TODO",
  blockStatus: "not started",
  parentId: "content-a",
  leftId: "located-child2",
  archived: false,
};
const child3Located = createLocatedBlock(child3LocatedData);

const contentAData: IBlockContentData = {
  id: "content-a",
  verb: verb(VERB.DO),
  humanText: "Do the following things",
  userId: "TODO",
  childLocatedBlocks: List([child1Located.id, child2Located.id, child3Located.id]),
  locatedBlocks: List([rootLocated.id]),
};
const contentA = createBlockContent(contentAData);

const contentBData: IBlockContentData = {
  id: "content-b",
  verb: verb(VERB.CHOOSE),
  humanText: "Read this",
  userId: "TODO",
  childLocatedBlocks: List([]),
  locatedBlocks: List([child1Located.id]),
};
const contentB = createBlockContent(contentBData);

const contentCData: IBlockContentData = {
  id: "content-c",
  verb: verb(VERB.DO),
  humanText: "Do this specific thing",
  userId: "TODO",
  childLocatedBlocks: List([]),
  locatedBlocks: List([child2Located.id, child3Located.id]),
};
const contentC = createBlockContent(contentCData);

export const initialGraphState: IGraph = createGraph({
  locatedBlocks: Map<LocatedBlockId, ILocatedBlock>({
    "located-root": rootLocated,
    "located-child1": child1Located,
    "located-child2": child2Located,
    "located-child3": child3Located,
  }),
  blockContents: Map<BlockContentId, IBlockContent>({
    "content-a": contentA,
    "content-b": contentB,
    "content-c": contentC,
  }),
  activeParentPath: List([]),
  selectionRange: { start: List([]), end: List([]) },
  isSelectionActive: false,
  isSelectionDeep: false,
});
