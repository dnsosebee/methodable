import Link from "next/link";
import { BlockContentId } from "../../model/blockContent";
import { Path } from "../../model/graph";
import { IVerb } from "../../model/verbs/verb";

export interface IBlockHandlePresentation {
  text: string;
  className: string;
}

// // maps a block's parent type to the handle's presentation. undefined means no parent (current is root block)
// const BLOCK_HANDLE_PRESENTATIONS = {
//   [OPTIONAL_BLOCK_TYPES.DO]: {
//     text: (orderNum: number) => `${orderNum}.`,
//     className: "text-blue-300 hover:bg-gray-100",
//   },
//   [OPTIONAL_BLOCK_TYPES.CHOOSE]: {
//     text: (orderNum: number) => `${orderNum}.`,
//     className: "text-green-300 hover:bg-gray-100",
//   },
//   [OPTIONAL_BLOCK_TYPES.READ]: {
//     text: (orderNum: number) => "•",
//     className: "text-orange-300 pr-1.5 hover:bg-gray-100",
//   },
//   [OPTIONAL_BLOCK_TYPES.UNDEFINED]: {
//     text: (orderNum: number) => "✦",
//     className: "text-gray-300 pr-1",
//   },
//   [OPTIONAL_BLOCK_TYPES.QUOTE]: {
//     text: (orderNum: number) => "•",
//     className: "text-purple-300 pr-1.5 hover:bg-gray-100",
//   },
//   [OPTIONAL_BLOCK_TYPES.EDIT]: {
//     text: (orderNum: number) => "•",
//     className: "text-red-300 pr-1.5 hover:bg-gray-100",
//   },
// };

export interface IBlockHandleProps {
  verb: IVerb;
  parentVerb: IVerb;
  orderIndex?: number;
  rootContentId: BlockContentId;
  pathRelativeToRoot: Path; // for creating the link
}

export const BlockHandle = (props: IBlockHandleProps) => {
  const presentation: IBlockHandlePresentation = props.parentVerb.getChildBlockHandlePresentation(
    props.verb,
    props.orderIndex
  );
  const buttonClasses = `select-none w-6 text-right rounded ${presentation.className}`;
  const link = `/edit/${props.rootContentId}/${props.pathRelativeToRoot}`;

  return (
    <Link href={link}>
      <a>
        <p className={buttonClasses}>{presentation.text}</p>
      </a>
    </Link>
  );
};
