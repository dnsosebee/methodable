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
    graphDispatch((graphState: IGraph) => {
      return graphState.updateBlockVerb(props.content.id, props.content.verb.getNext());
    });
  };

  const buttonClasses = `w-5 h-5 m-0.5 select-none border rounded-md text-xs self-center ${presentation.className}`;

  return (
    <button onClick={handleButtonClick} className={buttonClasses}>
      {presentation.text}
    </button>
  );
};
