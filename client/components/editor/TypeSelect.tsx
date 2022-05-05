import { useContext } from "react";
import { ActionType, changeBlockType } from "../../model/state/actions";
import { IBlockType, BLOCK_TYPES } from "../../model/state/blockType";
import { BlockId, IState } from "../../model/state/stateTypes";
import { emojiButtonClasses } from "../../styles/styles";
import { Context } from "../ContextWrapper";
interface IBlockTypePresentation {
  text: string;
  tooltip: string;
  className: string;
}

const BLOCK_TYPE_PRESENTATIONS = {
  [BLOCK_TYPES.DO]: {
    text: "🏃",
    tooltip: "Do an instruction",
    className: "text-blue-700 bg-blue-100 border-blue-200",
  },
  [BLOCK_TYPES.CHOOSE]: {
    text: "❓",
    tooltip: "Choose an option",
    className: "text-green-700 bg-green-100 border-green-200",
  },
  [BLOCK_TYPES.READ]: {
    text: "📖",
    tooltip: "Read a note",
    className: "text-orange-700 bg-orange-100 border-orange-200",
  },
  [BLOCK_TYPES.REFERENCE]: {
    text: "👁️",
    tooltip: "Reference a workspace",
    className: "text-purple-700 bg-purple-100 border-purple-200",
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

  const buttonClasses = `${emojiButtonClasses} ${presentationData.className}`;

  return (
    <button onClick={handleButtonClick} className={buttonClasses}>
      {presentationData.text}
    </button>
  );
};
