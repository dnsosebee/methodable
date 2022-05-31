import Link from "next/link";
import { BASE_URL } from "../../../pages/[mode]/[rootContentId]";
import { IBlockContent } from "../../model/blockContent";

export interface IEntryProps {
  content: IBlockContent;
}

export const Entry = (props: IEntryProps) => {
  return (
    <div className={"flex flex-col flex-grow"}>
      <h1>{props.content.humanText}</h1>
      <p className={"italic text-sm mb-5 flex-grow"}>A Human Program</p>
      <Link href={BASE_URL + "edit/" + props.content.id + "/,"}>
        <a
          onClick={() => {
            console.log("TODO");
          }}
          className={`p-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded justify-self-end`}
        >
          Click here to begin
        </a>
      </Link>
    </div>
  );
};
