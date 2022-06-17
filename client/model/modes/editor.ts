import { List } from "immutable";
import { Path, SelectionRange } from "../graph/graph";

export interface IEditorData {
  activeParentPath: Path;
  selectionRange: Readonly<SelectionRange>;
  isSelectionActive: Readonly<boolean>;
  isSelectionByText: Readonly<boolean>;
}

export interface IEditorTransitions {
  setSelectionParent: () => IEditor;
  startSelection: (path: Path) => IEditor;
  changeSelection: (path: Path) => IEditor;
  endSelection: () => IEditor;
  toggleSelectionType: () => IEditor;
}

export interface IEditor extends IEditorData, IEditorTransitions {}

export const createEditor = (editorData: Readonly<IEditorData>): IEditor => {
  const transitions = {
    // selection related
    toggleSelectionType: () => {
      return createEditor({
        ...editorData,
        isSelectionByText: !editorData.isSelectionByText,
      });
    },
    setSelectionParent: () => {
      // must run after selectionRange is updated
      const { selectionRange } = editorData;
      const maxParentDepth = Math.min(selectionRange.start.size - 1, selectionRange.end.size - 1);
      let parentDepth = 0;
      for (let i = 0; i < maxParentDepth; i++) {
        if (selectionRange.start.get(i) === selectionRange.end.get(i)) {
          parentDepth += 1;
        } else {
          break;
        }
      }
      return createEditor({
        ...editorData,
        activeParentPath: selectionRange.start.slice(0, parentDepth),
      });
    },
    startSelection: (path: Path) => {
      if (path.size < 1) {
        throw new Error("Can't select root block");
      }
      return createEditor({
        ...editorData,
        selectionRange: { start: path, end: path },
        isSelectionActive: true,
      }).setSelectionParent();
    },
    changeSelection: (path: Path) => {
      if (path.size < 1) {
        throw new Error("Can't select root block");
      }
      return createEditor({
        ...editorData,
        selectionRange: { start: editorData.selectionRange.start, end: path },
      }).setSelectionParent();
    },
    endSelection: () => {
      return createEditor({
        ...editorData,
        isSelectionActive: false,
      });
    },
  };
  return { ...editorData, ...transitions };
};

const editor = createEditor({
  activeParentPath: List(),
  selectionRange: { start: List(), end: List() },
  isSelectionActive: false,
  isSelectionByText: false,
});
