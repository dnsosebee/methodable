import Link from "next/link";
import { BlockContentId } from "../../../model/graph/blockContent";

// a component that's a button that links to the page to run the current block
export interface IRunButtonProps {
  contentId: BlockContentId;
  isRoot: boolean;
}

export const RunButton = (props: IRunButtonProps) => {
  return (
    <Link href={`/guide/${props.contentId}`}>
      {/* a button with a link to the page to run the current block */}
      <a target="_blank">
        <button
          className={`min-w-[1.25rem] px-1 ml-2 min-h-[1.25rem] text-gray-700 bg-gray-100 border-gray-200 border rounded-lg select-none flex-none ${
            props.isRoot ? "h-7 w-16 mb-1 text-sm" : " text-xs"
          }`}
        >
          {props.isRoot && "Run "}▶︎
        </button>
      </a>
    </Link>
  );
};
