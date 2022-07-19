import ReactMarkdown from "react-markdown";

export interface RichifiedTextProps {
  text: string;
}

export const RichifiedText = (props: RichifiedTextProps) => {
  const { text } = props;
  return (
    <ReactMarkdown
      components={{
        h1: "span",
        h2: "span",
        h3: "span",
        h4: "span",
        h5: "span",
        h6: "span",
        p: "span",
      }}
    >
      {text}
    </ReactMarkdown>
  );
};
