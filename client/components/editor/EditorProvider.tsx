import { List } from "immutable";
import { createContext, useContext, useReducer } from "react";
import { createEditor, IEditor } from "../../model/modes/editor";

export type EditorAction = (state: Readonly<IEditor>) => IEditor;

const editorReducer = (state: IEditor, action: EditorAction): IEditor => {
  return action(state);
};

const editorContext = createContext(null);

export type IEditorContext = { editorState: IEditor; editorDispatch: React.Dispatch<EditorAction> };

export const useEditor = (): IEditorContext => {
  const context = useContext(editorContext);
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
};

export interface IEditorProviderProps {
  children: React.ReactNode;
}

export const EditorProvider = (props: IEditorProviderProps) => {
  const initialState = createEditor({
    activeParentPath: List(),
    selectionRange: { start: List(), end: List() },
    isSelectionActive: false,
    isSelectionByText: false,
  });
  const [editorState, editorDispatch] = useReducer(editorReducer, initialState);
  return (
    <editorContext.Provider value={{ editorState, editorDispatch }}>
      {props.children}
    </editorContext.Provider>
  );
};
