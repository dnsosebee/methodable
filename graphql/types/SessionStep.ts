import { objectType } from "nexus";
import { Session } from "./Session";
import { Step } from "./Step";

export const SessionStep = objectType({
  name: "SessionStep",
  definition(t) {
    t.string("id");
    t.field("step", { type: Step });
    t.field("session", { type: Session });
  },
});
