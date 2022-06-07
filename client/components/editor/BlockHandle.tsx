import Link from "next/link";
import { BlockContentId } from "../../model/blockContent";
import { Path } from "../../model/graph";
import { IVerb } from "../../model/verbs/verb";

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
  const presentation: IBlockHandlePresentation = props.parentVerb.getChildBlockHandlePresentation(
    props.verb,
    props.orderIndex
  );
  const buttonClasses = `font-bold select-none w-5 text-right py-1 pr-0.5 text-xs rounded ${presentation.className}`;
  const link = `/edit/${props.rootContentId}/${props.pathRelativeToRoot.join(',')}`;

  return (
    <Link href={link}>
      <a>
        <p className={buttonClasses}>{presentation.text}</p>
      </a>
    </Link>
  );
};
