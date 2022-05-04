// custom errors

import { logError } from "./loggers";

export class HIndexNotFoundError extends Error {
  constructor() {
    logError("HIndexNotFoundError");
    super("HierarchyIndex not found");
  }
}

export class ModeNotFoundError extends Error {
  constructor() {
    logError("ModeNotFoundError");
    super("Mode not found");
  }
}
