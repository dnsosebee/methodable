import { gql } from "apollo-server-micro";

export const typeDefs = gql`
  enum Role {
    USER
    ADMIN
  }

  enum Role {
    USER
    ADMIN
  }

  enum AccessType {
    PRIVATE
    PUBLIC
  }

  enum BlockType {
    IMPERATIVE
    QUESTION
    DECLARATION
  }

  enum BlockState {
    NOT_STARTED
    IN_PROGRESS
    COMPLETE
    ARCHIVED
  }

  type User {
    id: String
    name: String
    email: String
    image: String
    role: Role
    blocks: [Block]
  }

  type Block {
    id: String
    actingUser: User
    accessType: AccessType
    blockType: BlockType
    blockState: BlockState
    humanText: String
    parents: [HierarchyRelation]
    children: [HierarchyRelation]
    workspace: String
    workspaceOutgoing: [ReferenceRelation]
    workspaceIncoming: [ReferenceRelation]
    oldVersion: Block
    newVersions: [Block]
  }

  type HierarchyRelation {
    id: String
    child: Block
    parent: Block
    childIndex: Int
  }

  type ReferenceRelation {
    id: String
    blockFrom: Block
    blockTo: Block
  }

  type Query {
    blocks: [Block]!
  }
`;
