import { useEditor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { Editor } from "@tiptap/core/dist/packages/core/src/Editor";

// TODO delete that ID, pull it up
const findBlockQuery = gql`
  query {
    findBlock(id: "8f6d62b8-0ccf-489d-a7ed-eed5e24e41b6") {
      id
      humanText
    }
  }
`;

const updateBlockMutation = gql`
  mutation updateBlockMutation($humanText: String!) {
    updateBlock(id: "8f6d62b8-0ccf-489d-a7ed-eed5e24e41b6", humanText: $humanText) {
      id
      humanText
    }
  }
`;

const ProgramEditor = () => {
  const [databaseBlock, updateDatabaseBlock] = useState(null);
  const { data, loading, error } = useQuery(findBlockQuery);
  const [updateBlock] = useMutation(updateBlockMutation, {
    update: (proxy, mutationResult) => {
      updateDatabaseBlock(mutationResult.data.updateBlock);
    },
  });

  const upToDate = () => {
    return databaseBlock && editor && databaseBlock.humanText === editor.getText();
  };

  const handleUpdateBlock = (editor: Editor) => {
    const text = editor.getText();
    updateBlock({ variables: { humanText: text } });
  };

  const editor = useEditor({
    extensions: [Document, Paragraph, Text],
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
    content: `<p>loading...</p>`,
    onUpdate({ editor }) {
      handleUpdateBlock(editor);
    },
  });

  useEffect(() => {
    if (data) {
      editor.commands.setContent(`<p>${data.findBlock.humanText}</p>`);
      updateDatabaseBlock(data.findBlock);
    }
  }, [!!data]);

  useEffect(() => {
    if (editor && databaseBlock) {
      if (databaseBlock.humanText !== editor.getText()) {
        handleUpdateBlock(editor);
      }
    }
  }, [databaseBlock]);

  return (
    <>
      <div className="outline p-1">
        {data && (
          <>
            <EditorContent editor={editor} />
          </>
        )}
      </div>
      <p className="italic">{upToDate() ? "up to date" : "saving..."}</p>
      {/* {databaseBlock && <p>database block: {databaseBlock.humanText}</p>}
      {editor && <p>editor text: {editor.getText()}</p>} */}
    </>
  );
};

export default ProgramEditor;
