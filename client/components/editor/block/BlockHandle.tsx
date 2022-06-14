import Link from "next/link";
import { BlockContentId } from "../../../model/graph/blockContent";
import { Path } from "../../../model/graph/graph";
import { IVerb } from "../../../model/verbs/verb";
import { getLink, MODE } from "../../../model/view";
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
  const { viewState } = useView();
  const presentation: IBlockHandlePresentation = props.parentVerb.getChildBlockHandlePresentation(
    props.verb,
    props.orderIndex
  );
  const buttonClasses = `flex-none font-bold select-none w-5 h-7 text-right py-1 pr-0.5 text-xs rounded ${presentation.className}`;
  const link = getLink(viewState, { mode: MODE.EDIT, rootRelativePath: props.pathRelativeToRoot });

  return (
    <Link href={link}>
      <a className={buttonClasses}>
        <p>{presentation.text}</p>
      </a>
    </Link>
  );
};
