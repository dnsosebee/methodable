import Link from "next/link";
import { RichifiedText } from "./RichifiedText";

export interface IContextLineProps {
  pre: string;
  text: string;
  href: string;
}

export const ContextLine = (props: IContextLineProps) => {
  const { pre, text, href } = props;
  return (
    <div className="flex mt-1">
      <p className="text-gray-400">•</p>
      <p className="ml-2 text-gray-400">
        <span>{pre}</span>
        <Link href={href}>
          <a className="text-blue-400 underline hover:text-blue-500">
            <RichifiedText text={text} />
          </a>
        </Link>
        {"."}
      </p>
    </div>
  );
};
