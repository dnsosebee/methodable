import { useContext } from "react";
import { GraphAction, IGraph, Path } from "../../model/graph";
import { GraphContext } from "../GraphContextWrapper";
import { IBlockContent } from "../../model/blockContent";

export interface IVerbSelectPresentation {
  text: string;
  tooltip: string;
  className: string;
}

// const BLOCK_TYPE_PRESENTATIONS = {
//   [BLOCK_TYPES.DO]: {

//   },
//   [BLOCK_TYPES.CHOOSE]: {
//     text: "❓",
//     tooltip: "Choose an option",
//     className:
//       "text-green-700 bg-green-100 border-green-200 hover:bg-green-200 hover:border-green-400",
//   },
//   [BLOCK_TYPES.READ]: {
//     text: "📖",
//     tooltip: "Read a note",
//     className:
//       "text-orange-700 bg-orange-100 border-orange-200 hover:bg-orange-200 hover:border-orange-400",
//   },
//   [BLOCK_TYPES.QUOTE]: {
//     // eyes emoji
//     text: "👀", // or, ”
//     tooltip: "add a quote to all descendants of the parent block",
//     className:
//       "text-purple-700 bg-purple-100 border-purple-200 hover:bg-purple-200 hover:border-purple-400",
//   },
//   [BLOCK_TYPES.EDIT]: {
//     text: "✏️",
//     tooltip: "Add an editor to all descendants of the parent block",
//     className: "text-red-700 bg-red-100 border-red-200 hover:bg-red-200 hover:border-red-400",
//   },
// };

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
