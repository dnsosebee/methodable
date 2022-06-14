import Link from "next/link";

export interface IContextLineProps {
  pre: string;
  text: string;
  href: string;
}

export const ContextLine = (props: IContextLineProps) => {
  const { pre, text, href } = props;
  return (
    <div className="flex mt-1">
      <p>•</p>
      <p className="ml-2">
        {pre}
        <Link href={href}>
          <a className="text-blue-500 underline">{text}</a>
        </Link>
        {"."}
      </p>
    </div>
  );
};
