import { useContext } from "react";
import { GraphAction, IGraph } from "../../model/graph";
import { GraphContext } from "../GraphContextWrapper";
import { IBlockContent } from "../../model/blockContent";

export interface IVerbSelectPresentation {
  text: string;
  tooltip: string;
  className: string;
}

export interface IVerbSelectProps {
  content: IBlockContent;
}

export const VerbSelect = (props: IVerbSelectProps) => {
  const { dispatch }: { dispatch: (action: GraphAction) => {} } = useContext(GraphContext);
  const presentation = props.content.verb.getVerbSelectPresentation();
  const handleButtonClick = () => {
    dispatch((state: IGraph) => {
      return state.updateBlockVerb(props.content.id, props.content.verb.getNext());
    });
  };

  const buttonClasses = `w-5 h-5 m-0.5 select-none border rounded-md text-xs ${presentation.className}`;

  return (
    <button onClick={handleButtonClick} className={buttonClasses}>
      {presentation.text}
    </button>
  );
};
