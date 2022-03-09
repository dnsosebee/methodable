import { Context } from "./context";

export const resolvers = {
  Query: {
    blocks: (_parent, _args, ctx: Context) => {
      return ctx.prisma.block.findMany();
    },
  },
};
