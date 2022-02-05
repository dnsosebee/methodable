import { objectType } from "nexus";
import { SessionStep } from "./SessionStep";
import { User } from "./User";

export const Session = objectType({
  name: "Session",
  definition(t) {
    t.string("id");
    t.field("user", { type: User });
    t.list.field("steps", {
      type: SessionStep,
      async resolve(_parent, _args, ctx) {
        return await ctx.prisma.session
          .findUnique({
            where: {
              id: _parent.id,
            },
          })
          .steps();
      },
    });
  },
});
