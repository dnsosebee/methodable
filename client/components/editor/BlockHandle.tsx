import { OPTIONAL_BLOCK_TYPES } from "../../model/state/blockType";

interface IBlockHandlePresentation {
  text: (orderNum: number) => string;
  className: string;
}

// maps a block's parent type to the handle's presentation. undefined means no parent (current is root block)
const BLOCK_HANDLE_PRESENTATIONS = {
  [OPTIONAL_BLOCK_TYPES.DO]: {
    text: (orderNum: number) => `${orderNum}.`,
    className: "text-blue-200",
  },
  [OPTIONAL_BLOCK_TYPES.CHOOSE]: {
    text: (orderNum: number) => `${orderNum}.`,
    className: "text-green-200",
  },
  [OPTIONAL_BLOCK_TYPES.READ]: {
    text: (orderNum: number) => "•",
    className: "text-orange-200",
  },
  [OPTIONAL_BLOCK_TYPES.UNDEFINED]: {
    text: (orderNum: number) => ">",
    className: "text-gray-200",
  },
};

export interface IBlockHandleProps {
  parentBlockType: symbol;
  orderNum: number;
}

export const BlockHandle = (props: IBlockHandleProps) => {
  const presentationData: IBlockHandlePresentation =
    BLOCK_HANDLE_PRESENTATIONS[props.parentBlockType];
  const text = presentationData.text(props.orderNum);
  const buttonClasses = ` ${presentationData.className}`;

  return <button className={buttonClasses}>{text}&nbsp;</button>;
};
