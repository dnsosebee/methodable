// custom errors

import { logError } from "./loggers";

export class NoSuchBlockError extends Error {
  constructor() {
    logError("NoSuchBlockError");
    super("No such block exists");
  }
}

export class ModeNotFoundError extends Error {
  constructor() {
    logError("ModeNotFoundError");
    super("Mode not found");
  }
}
