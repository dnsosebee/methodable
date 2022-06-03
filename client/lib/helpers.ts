// random helpers

import { Editor } from "@tiptap/core/dist/packages/core/src/Editor";
import { Path } from "../model/graph";

// just synchronously waits for a bit
export const wait = (ms: number) => {
  var start = Date.now(),
    now = start;
  while (now - start < ms) {
    now = Date.now();
  }
};

export const pathEquals = (path1: Path | null, path2: Path | null) => {
  if (!path1 || !path2) {
    return false;
  }
  if (path1.size !== path2.size) {
    return false;
  }
  for (let i = 0; i < path1.size; i++) {
    if (path1.get(i) !== path2.get(i)) {
      return false;
    }
  }
  return true;
};

export const getFocusPosition = (editor: Editor): number => {
  return editor.view.state.selection.to;
};

export const isDev = () => {
  return !process.env.NODE_ENV || process.env.NODE_ENV === "development";
};
