import { IBlockContent } from "../../model/blockContent";

export interface IRefCountProps {
  content: IBlockContent;
}

export const RefCount = (props: IRefCountProps) => {
  if (props.content.locatedBlocks.size < 2) {
    return null;
  }

  const buttonClasses = `flex-none mr-0.5 select-none text-xs text-yellow-500`;

  return (
    <div
      className={buttonClasses}
      // style={{ background: `#${props.content.id.slice(0, 6)}` }}
    >{props.content.locatedBlocks.size}</div>
  );
};
