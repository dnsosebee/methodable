import { objectType } from "nexus";
import { Step } from "./Step";

export const Anchor = objectType({
  name: "Anchor",
  definition(t) {
    t.string("id");
    t.field("parent", { type: Step });
  },
});
