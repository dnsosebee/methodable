//backend
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
  },
};

