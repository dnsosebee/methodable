import Link from "next/link";
import { BlockContentId } from "../../model/newState";
import { genericButtonClasses } from "../../styles/styles";

// a component that's a button that links to the page to run the current block
export interface IRunButtonProps {
  contentId: BlockContentId;
}

export const RunButton = (props: IRunButtonProps) => {
  return (
    <Link href={`/guide/${props.contentId}`}>
      {/* a button with a link to the page to run the current block */}
      <a>
        <button className={genericButtonClasses + " " + "text-gray-700 bg-gray-100 border-gray-200"}>
          ▶︎
        </button>
      </a>
    </Link>
  );
};
