// TODO: DELETE THIS FILE

import React from "react";
import { EditorContent, NodeViewWrapper, useEditor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import History from "@tiptap/extension-history";


const OldBlock = (props) => {

  const content =
    Math.random() > 0.3
      ? "<p>Hey world...</p><block-component> </block-component>"
      : "<p>All done</p>";

  const editor = useEditor({
    extensions: [Document, Paragraph, Text, History],
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
    content,
  });

  return (
    <NodeViewWrapper className="block-component">
      <div className="pl-10 outline">
        <EditorContent editor={editor} />
      </div>
      {/* <span className="label">React Component</span>

      <div className="content">
        <button onClick={increase}>
          This button has been clicked {props.node.attrs.count} times.
        </button>
      </div> */}
    </NodeViewWrapper>
  );
};

export default OldBlock;
