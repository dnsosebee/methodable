import { useContext } from "react";
import { Action, IState, Path } from "../../model/state";
import { blockType, BLOCK_TYPES } from "../../model/blockType";
import { Context } from "../ContextWrapper";
import { IBlockContent } from "../../model/blockContent";
interface IBlockTypePresentation {
  text: string;
  tooltip: string;
  className: string;
}

const BLOCK_TYPE_PRESENTATIONS = {
  [BLOCK_TYPES.DO]: {
    text: "🏃",
    tooltip: "Do an instruction",
    className: "text-blue-700 bg-blue-100 border-blue-200 hover:bg-blue-200 hover:border-blue-400",
  },
  [BLOCK_TYPES.CHOOSE]: {
    text: "❓",
    tooltip: "Choose an option",
    className: "text-green-700 bg-green-100 border-green-200 hover:bg-green-200 hover:border-green-400",
  },
  [BLOCK_TYPES.READ]: {
    text: "📖",
    tooltip: "Read a note",
    className: "text-orange-700 bg-orange-100 border-orange-200 hover:bg-orange-200 hover:border-orange-400",
  },
  [BLOCK_TYPES.REFERENCE]: {
    text: "👁️",
    tooltip: "Reference a workspace",
    className: "text-purple-700 bg-purple-100 border-purple-200 hover:bg-purple-200 hover:border-purple-400",
  },
};

export interface ITypeSelectProps {
  content: IBlockContent;
}

export const TypeSelect = (props: ITypeSelectProps) => {
  const { dispatch }: { dispatch: (action: Action) => {} } = useContext(Context);
  const presentationData: IBlockTypePresentation =
    BLOCK_TYPE_PRESENTATIONS[props.content.blockType.name];
  const handleButtonClick = () => {
    dispatch((state: IState) => {
      return state.updateBlockType(props.content.id, props.content.blockType.getNext());
    });
  };

  const buttonClasses = `w-5 h-5 m-0.5 select-none border rounded-md text-xs ${presentationData.className}`;

  return (
    <button onClick={handleButtonClick} className={buttonClasses}>
      {presentationData.text}
    </button>
  );
};
