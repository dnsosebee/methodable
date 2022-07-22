import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import Fuse from "fuse.js";
import { List } from "immutable";
import { useContext, useEffect, useState } from "react";
import { MODE } from "../../model/view";
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
    <div className="mb-2">
      <div className="flex">
        <EditorContent editor={editor} className="flex-grow hover:bg-gray-100" />
        {search !== "" && (
          <button
            onClick={() => {
              setSearch("");
            }}
            className="h-6 px-2 ml-2 text-gray-700 bg-orange-200 hover:bg-orange-300 rounded shadow"
          >
            Clear Search
          </button>
        )}
      </div>
      {search === "" ? null : (
        <div className="flex flex-col absolute bg-gray-50 z-50 p-2 border w-[calc(100%_-_35px)] max-h-96 shadow-2xl mt-2">
          <p className="text-lg mb-2">Search results</p>
          <div className="overflow-y-auto">
            {results.map((result, index) => (
              <div
                className="flex w-full"
                onClick={() => {
                  setSearch("");
                }}
              >
                <p className="self-center mt-1 mr-2">{index + 1}.</p>
                <GuideButton
                  text={result.item.value}
                  partialView={{
                    mode: MODE.EDIT,
                    rootContentId: result.item.key,
                    rootRelativePath: List(),
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
