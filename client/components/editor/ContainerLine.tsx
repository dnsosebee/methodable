import { OPTIONAL_BLOCK_TYPES } from "../../model/state/blockType";

interface IContainerLinePresentation {
  className: string;
}

// maps a block's parent type to the handle's presentation. undefined means no parent (current is root block)
const CONTAINER_LINE_PRESENTATIONS = {
  [OPTIONAL_BLOCK_TYPES.DO]: {
    className: "bg-gray-200",
  },
  [OPTIONAL_BLOCK_TYPES.CHOOSE]: {
    className: "bg-gray-200",
  },
  [OPTIONAL_BLOCK_TYPES.READ]: {
    className: "bg-gray-200",
  },
  [OPTIONAL_BLOCK_TYPES.REFERENCE]: {
    className: "bg-gray-200",
  },
  [OPTIONAL_BLOCK_TYPES.UNDEFINED]: {
    className: "bg-gray-200",
  },
};

export interface IContainerLineProps {
  parentBlockType: symbol;
}

export const ContainerLine = (props: IContainerLineProps) => {
  const presentationData: IContainerLinePresentation =
    CONTAINER_LINE_PRESENTATIONS[props.parentBlockType];
  return <div className={`w-1 mr-1 ml-3 my-1 rounded-sm ${presentationData.className}`} />;
};
