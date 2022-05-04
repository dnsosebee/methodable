import { useContext } from "react";
import { ActionType, changeBlockType } from "../../model/state/actions";
import { IBlockType, BLOCK_TYPES } from "../../model/state/blockType";
import { BlockId, IState } from "../../model/state/stateTypes";
import { Context } from "../ContextWrapper";
interface IBlockTypePresentation {
  text: string;
  tooltip: string;
  className: string;
}

const BLOCK_TYPE_PRESENTATIONS = {
  [BLOCK_TYPES.DO]: {
    text: "🏃",
    tooltip: "Do",
    className: "text-blue-700 bg-blue-100 border-blue-200",
  },
  [BLOCK_TYPES.CHOOSE]: {
    text: "❓",
    tooltip: "Choose",
    className: "text-green-700 bg-green-100 border-green-200",
  },
  [BLOCK_TYPES.READ]: {
    text: "📖",
    tooltip: "Read",
    className: "text-orange-700 bg-orange-100 border-orange-200",
  },
};

export interface ITypeSelectProps {
  id: BlockId;
  blockType: IBlockType;
}

export const TypeSelect = (props: ITypeSelectProps) => {
  const { dispatch }: { dispatch: (action: ActionType) => {} } = useContext(Context);
  const presentationData: IBlockTypePresentation = BLOCK_TYPE_PRESENTATIONS[props.blockType.name];

  const handleButtonClick = () => {
    dispatch((state: IState) => {
      return changeBlockType(state, props.id, props.blockType.getNext());
    });
  };

  const buttonClasses = `w-5 m-0.5 p-0.5 border rounded-md text-gray-300 text-xs ${presentationData.className}`;

  return (
    <button onClick={handleButtonClick} className={buttonClasses}>
      {presentationData.text}
    </button>
  );
};
