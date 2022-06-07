import { IGraph } from "../../model/graph";
import { useGraph } from "../GraphProvider";
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
  const { graphDispatch } = useGraph();
  const presentation = props.content.verb.getVerbSelectPresentation();
  const handleButtonClick = () => {
    graphDispatch((state: IGraph) => {
      return state.updateBlockVerb(props.content.id, props.content.verb.getNext());
    });
  };

  const buttonClasses = `flex-none w-5 mt-0.5 mr-0.5 select-none border rounded-md text-xs ${presentation.className}`;

  return (
    <button onClick={handleButtonClick} className={buttonClasses}>
      {presentation.text}
    </button>
  );
};
