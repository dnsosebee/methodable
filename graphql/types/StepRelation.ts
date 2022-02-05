import { objectType } from "nexus";
import { Step } from "./Step";

export const StepRelation = objectType({
  name: "StepRelation",
  definition(t) {
    t.string("id");
    t.field("child", { type: Step });
    t.field("parent", { type: Step });
    t.int("childIndex");
  },
});
