import { enumType, objectType } from "nexus";
import { Session } from "./Session";
import { Step } from "./Step";

const Role = enumType({
  name: "Role",
  members: ["USER", "ADMIN"],
});

export const User = objectType({
  name: "User",
  definition(t) {
    t.string("id");
    t.string("name");
    t.string("email");
    t.string("image");
    t.field("role", { type: Role });
    t.list.field("steps", {
      type: Step,
      async resolve(_parent, _args, ctx) {
        return await ctx.prisma.user
          .findUnique({
            where: {
              id: _parent.id,
            },
          })
          .steps();
      },
    }),
      t.list.field("sessions", {
        type: Session,
        async resolve(_parent, _args, ctx) {
          return await ctx.prisma.user
            .findUnique({
              where: {
                id: _parent.id,
              },
            })
            .sessions();
        },
      });
  },
});
