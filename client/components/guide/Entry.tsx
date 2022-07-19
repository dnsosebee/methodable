import { List } from "immutable";
import { IBlockContent } from "../../model/graph/blockContent";
import { BeginButton } from "./buttons/BeginButton";
import { RichifiedText } from "./RichifiedText";

export interface IEntryProps {
  content: IBlockContent;
}

export const Entry = (props: IEntryProps) => {
  return (
    <>
      <h1 className="text-xl">
        <RichifiedText text={props.content.humanText} />
      </h1>
      <p className={"italic text-sm"}>A Human Program</p>
      <div className={"flex-grow"}></div>
      <BeginButton
        {...{
          text: "Begin",
          highlight: true,
          content: props.content,
          path: List(),
        }}
      />
    </>
  );
};
