// a temp file for initial state
import { List, Map } from "immutable";
import {
  BlockContentId,
  createBlockContent,
  IBlockContent,
  IBlockContentData,
} from "../model/graph/blockContent";
import { createGraph, IGraph } from "../model/graph/graph";
import {
  createLocatedBlock,
  ILocatedBlock,
  ILocatedBlockData,
  LocatedBlockId,
} from "../model/graph/locatedBlock";
import { createVerb, VERB } from "../model/verbs/verb";

const rootLocatedData: ILocatedBlockData = {
  id: "located-root",
  contentId: "home",
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
  parentId: "home",
  leftId: null,
  archived: false,
};
const child1Located = createLocatedBlock(child1LocatedData);

const child2LocatedData: ILocatedBlockData = {
  id: "located-child2",
  contentId: "content-c",
  userId: "TODO",
  blockStatus: "not started",
  parentId: "home",
  leftId: "located-child1",
  archived: false,
};
const child2Located = createLocatedBlock(child2LocatedData);

const child3LocatedData: ILocatedBlockData = {
  id: "located-child3",
  contentId: "content-c",
  userId: "TODO",
  blockStatus: "not started",
  parentId: "home",
  leftId: "located-child2",
  archived: false,
};
const child3Located = createLocatedBlock(child3LocatedData);

const rootContentData: IBlockContentData = {
  id: "home",
  verb: createVerb(VERB.DO),
  humanText: "Do the following things",
  computerText: "",
  userId: "TODO",
  childLocatedBlocks: List([child1Located.id, child2Located.id, child3Located.id]),
  locatedBlocks: List([rootLocated.id]),
  archived: false,
};
const rootContent = createBlockContent(rootContentData);

const contentBData: IBlockContentData = {
  id: "content-b",
  verb: createVerb(VERB.CHOOSE),
  humanText: "Read this",
  computerText: "",
  userId: "TODO",
  childLocatedBlocks: List([]),
  locatedBlocks: List([child1Located.id]),
  archived: false,
};
const contentB = createBlockContent(contentBData);

const contentCData: IBlockContentData = {
  id: "content-c",
  verb: createVerb(VERB.DO),
  humanText: "Do this specific thing",
  computerText: "",
  userId: "TODO",
  childLocatedBlocks: List([]),
  locatedBlocks: List([child2Located.id, child3Located.id]),
  archived: false,
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
    home: rootContent,
    "content-b": contentB,
    "content-c": contentC,
  }),
});
