import { Context } from "./context";

export const resolvers = {
  Query: {
    steps: (_parent, _args, ctx: Context) => {
      return ctx.prisma.step.findMany();
    },
  },
};
