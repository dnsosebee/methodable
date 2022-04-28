import { useContext } from "react";
import { IAction, IChangeBlockTypeAction } from "../../model/state/actionTypes";
import { BlockType, BLOCK_TYPES } from "../../model/state/blockType";
import { BlockId, IState } from "../../model/state/stateTypes";
import { Context } from "./ContextBlock";

const BLOCK_TYPE_PRESENTATION = {
  [BLOCK_TYPES.INSTRUCTION]: {
    text: "🏃",
    tooltip: "Instruction",
    className: "text-blue-700 bg-blue-100 border-blue-200",
  },
  [BLOCK_TYPES.QUESTION]: {
    text: "❓",
    tooltip: "Question",
    className: "text-green-700 bg-green-100 border-green-200",
  },
  [BLOCK_TYPES.READING]: {
    text: "📖",
    tooltip: "Reading",
    className: "text-orange-700 bg-orange-100 border-orange-200",
  },
};

export interface ITypeSelectProps {
  id: BlockId;
  blockType: BlockType;
}

export const TypeSelect = (props: ITypeSelectProps) => {
  const { dispatch }: { state: IState; dispatch: (action: IAction) => {} } = useContext(Context);
  const presentationData = BLOCK_TYPE_PRESENTATION[props.blockType.name];

  const handleButtonClick = () => {
    const action: IChangeBlockTypeAction = {
      type: "change block type",
      id: props.id,
      blockType: props.blockType.getNext(),
    };
    dispatch(action);
  };

  const buttonClasses = `w-5 m-0.5 p-0.5 border rounded-md text-gray-300 text-xs ${presentationData.className}`;

  return (
    <button onClick={handleButtonClick} className={buttonClasses}>
      {presentationData.text}
    </button>
  );
};
