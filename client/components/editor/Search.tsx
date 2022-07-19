import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import Fuse from "fuse.js";
import { useContext, useEffect, useState } from "react";
import { graphContext } from "../GraphProvider";
import { GuideButton } from "../guide/buttons/GuideButton";

export interface SearchBarProps {}

export const Search = (props: SearchBarProps) => {
  const { graphState } = useContext(graphContext);
  const [search, setSearch] = useState("");
  let data: { key: string; value: string }[] = [];
  graphState.blockContents.forEach((content) => {
    data.push({ key: content.id, value: content.humanText });
  });
  const editor = useEditor({
    extensions: [
      Paragraph,
      Text,
      Document,
      Placeholder.configure({
        placeholder: "Search...",
      }),
    ],
    content: "<p></p>",
    onUpdate: (state) => {
      setSearch(state.editor.getText());
    },
  });

  useEffect(() => {
    if (search === "" && editor) {
      editor.commands.setContent("<p></p>");
    }
  }, [search, !!editor]);

  const options = {
    keys: ["value"],
  };
  const fuse = new Fuse(data, options);
  const results = fuse.search(search, { limit: 10 });
  return (
    <div className="mb-2 hover:bg-gray-100">
      <div className="flex">
        <EditorContent editor={editor} className="flex-grow" />
        <button
          onClick={() => {
            setSearch("");
          }}
          className="w-6 h-6 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded shadow"
        >
          X
        </button>
      </div>
      {search === "" ? null : (
        <div className="flex flex-col absolute bg-white z-50 p-2 border min-w-[97%] mt-2">
          <p className="text-lg">Search results</p>
          {results.map((result, index) => (
            <div
              className="flex"
              onClick={() => {
                setSearch("");
              }}
            >
              <p className="self-center mt-1 mr-2">{index + 1}.</p>
              <GuideButton text={result.item.value} href={`/edit/${result.item.key}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
