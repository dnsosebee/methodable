// random helpers

import { Editor } from "@tiptap/core/dist/packages/core/src/Editor";
import { FocusPosition, HierarchyIndex } from "../model/state/stateTypes";

// just synchronously waits for a bit
export const wait = (ms: number) => {
  var start = Date.now(),
    now = start;
  while (now - start < ms) {
    now = Date.now();
  }
};

export const hIndexEquals = (hIndex1: HierarchyIndex | null, hIndex2: HierarchyIndex | null) => {
  if (hIndex1 === null || hIndex2 === null) {
    return false;
  }
  if (hIndex1.length !== hIndex2.length) {
    return false;
  }
  for (let i = 0; i < hIndex1.length; i++) {
    if (hIndex1[i] !== hIndex2[i]) {
      return false;
    }
  }
  return true;
}

export const getFocusPosition = (editor: Editor): number => {
  return editor.view.state.selection.to;
}
