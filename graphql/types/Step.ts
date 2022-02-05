import { enumType, extendType, objectType } from "nexus";
import { Anchor } from "./Anchor";
import { SessionStep } from "./SessionStep";
import { StepRelation } from "./StepRelation";
import { User } from "./User";
const AccessType = enumType({
  name: "AccessType",
  members: ["PRIVATE", "PUBLIC"],
});

const StepType = enumType({
  name: "StepType",
  members: ["INSTRUCTION", "CHOICE"],
});

export const Step = objectType({
  name: "Step",
  definition(t) {
    t.string("id");
    t.string("text");
    t.field("user", { type: User });
    t.field("accessType", { type: AccessType });
    t.field("stepType", { type: StepType });
    t.list.field("parents", {
      type: StepRelation,
      async resolve(_parent, _args, ctx) {
        return await ctx.prisma.step
          .findUnique({
            where: {
              id: _parent.id,
            },
          })
          .parents();
      },
    });
    t.list.field("children", {
      type: StepRelation,
      async resolve(_parent, _args, ctx) {
        return await ctx.prisma.step
          .findUnique({
            where: {
              id: _parent.id,
            },
          })
          .children();
      },
    });
    t.list.field("anchors", {
      type: Anchor,
      async resolve(_parent, _args, ctx) {
        return await ctx.prisma.step
          .findUnique({
            where: {
              id: _parent.id,
            },
          })
          .anchors();
      },
    });
    t.list.field("sessionSteps", {
      type: SessionStep,
      async resolve(_parent, _args, ctx) {
        return await ctx.prisma.step
          .findUnique({
            where: {
              id: _parent.id,
            },
          })
          .sessionSteps();
      },
    });
  },
});

// TODO!!!
export const StepsQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.field("steps", {
      type: Step,
      resolve(_parent, _args, ctx) {
        return ctx.prisma.user.findMany();
      },
    });
  },
});
