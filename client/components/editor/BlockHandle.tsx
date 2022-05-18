import Link from "next/link";
import { BlockContentId } from "../../model/blockContent";
import { OPTIONAL_BLOCK_TYPES } from "../../model/blockType";
import { Path } from "../../model/state";

interface IBlockHandlePresentation {
  text: (orderNum: number) => string;
  className: string;
}

// maps a block's parent type to the handle's presentation. undefined means no parent (current is root block)
const BLOCK_HANDLE_PRESENTATIONS = {
  [OPTIONAL_BLOCK_TYPES.DO]: {
    text: (orderNum: number) => `${orderNum}.`,
    className: "text-blue-300 hover:bg-gray-100",
  },
  [OPTIONAL_BLOCK_TYPES.CHOOSE]: {
    text: (orderNum: number) => `${orderNum}.`,
    className: "text-green-300 hover:bg-gray-100",
  },
  [OPTIONAL_BLOCK_TYPES.READ]: {
    text: (orderNum: number) => "•",
    className: "text-orange-300 pr-1.5 hover:bg-gray-100",
  },
  [OPTIONAL_BLOCK_TYPES.UNDEFINED]: {
    text: (orderNum: number) => "✦",
    className: "text-gray-300 pr-1",
  },
  [OPTIONAL_BLOCK_TYPES.REFERENCE]: {
    text: (orderNum: number) => "•",
    className: "text-purple-300 pr-1.5 hover:bg-gray-100",
  },
};

export interface IBlockHandleProps {
  parentBlockType: symbol;
  orderNum: number;
  rootContentId: BlockContentId;
  pathRelativeToRoot: Path;
}

export const BlockHandle = (props: IBlockHandleProps) => {
  const presentationData: IBlockHandlePresentation =
    BLOCK_HANDLE_PRESENTATIONS[props.parentBlockType];
  const text = presentationData.text(props.orderNum);
  const buttonClasses = `select-none w-6 text-right rounded ${presentationData.className}`;
  const link = `/edit/${props.rootContentId}/${props.pathRelativeToRoot}`;

  return (
    <Link href={link}>
      <a>
        <p className={buttonClasses}>{text}</p>
      </a>
    </Link>
  );
};
