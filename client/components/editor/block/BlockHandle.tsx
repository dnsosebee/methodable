import { BlockContentId } from "../../../model/graph/blockContent";
import { Path } from "../../../model/graph/graph";
import { IVerb } from "../../../model/verbs/verb";
import { MODE } from "../../../model/view";
import { useView } from "../../ViewProvider";

export interface IBlockHandlePresentation {
  text: string;
  className: string;
}

export interface IBlockHandleProps {
  verb: IVerb;
  parentVerb: IVerb;
  orderIndex?: number;
  rootContentId: BlockContentId;
  pathRelativeToRoot: Path; // for creating the link
}

export const BlockHandle = (props: IBlockHandleProps) => {
  const { RedirectView } = useView();
  const presentation: IBlockHandlePresentation = props.parentVerb.getChildBlockHandlePresentation(
    props.verb,
    props.orderIndex
  );
  const buttonClasses = `flex-none font-bold select-none text-center w-5 h-7 pt-1.5 text-xs rounded-lg ${presentation.className}`;

  return (
    <RedirectView
      partialView={{ mode: MODE.EDIT, rootRelativePath: props.pathRelativeToRoot }}
      className={buttonClasses}
    >
      <span>{presentation.text}</span>
    </RedirectView>
  );
};
