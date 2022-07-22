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
      <p className="text-gray-300">•</p>
      <p className="ml-2 text-gray-300">
        <span>{pre}</span>
        <Link href={href}>
          <a className="text-blue-300 underline hover:text-blue-500">
            <RichifiedText text={text} />
          </a>
        </Link>
        {"."}
      </p>
    </div>
  );
};
