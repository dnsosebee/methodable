//backend
import { BlockType, BlockState, AccessType, User } from "@prisma/client";
import { Context } from "./context";

export const resolvers = {
  Query: {
    blocks: (_parent, _args, ctx: Context) => {
      return ctx.prisma.block.findMany();
    },
    findBlock: (_parent, args, ctx: Context) => {
      return ctx.prisma.block.findUnique({
        where: { id: args.id },
      });
    },
  },
  Mutation: {
    updateBlock: (_parent, args, ctx: Context) => {
      return ctx.prisma.block.update({
        where: {
          id: args.id,
        },
        data: {
          humanText: args.humanText,
        },
      });
    },
    createNewUserBlocks: async (_parent, args, ctx: Context) => {
      const user: User = await ctx.prisma.user.findUnique({
        where: { id: args.id },
      });
      console.log("user: " + user);
      console.dir(user);
      // user parent block
      // TODO: look into batch queries for parent/child relationships
      return ctx.prisma.block.create({
        data: {
          userId: args.id,
          blockType: BlockType.DECLARATION,
          humanText: user.name,
          workspace: "",
        },
      });
    },
  },
};

// model Block {
//   id                String              @id @default(uuid())
//   createdAt         DateTime            @default(now())
//   updatedAt         DateTime            @updatedAt
//   actingUser        User                @relation(fields: [userId], references: [id])
//   userId            String
//   accessType        AccessType          @default(PRIVATE)
//   blockType         BlockType           @default(IMPERATIVE)
//   blockState        BlockState          @default(NOT_STARTED)
//   humanText         String
//   parents           HierarchyRelation[] @relation("parents")
//   children          HierarchyRelation[] @relation("children")
//   workspace         String
//   workspaceOutgoing ReferenceRelation[] @relation("outgoing")
//   workspaceIncoming ReferenceRelation[] @relation("incoming")
//   originalVersion  VersionRelation?   @relation("original")
//   derivedVersions   VersionRelation[]   @relation("derived")
// }
