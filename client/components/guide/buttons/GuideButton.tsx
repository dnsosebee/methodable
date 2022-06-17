import Link from "next/link";

export interface IGuideButtonVisualProps {
  text: string;
  center?: boolean;
  highlight?: boolean;
}

export interface IGuideButtonProps extends IGuideButtonVisualProps {
  href: string;
}

export const GuideButton = (props: IGuideButtonProps) => {
  return (
    <Link href={props.href}>
      <a>
        <p
          className={`font-bold p-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded mt-2 shadow ${
            props.center ? "text-center" : ""
          } ${props.highlight ? " bg-blue-100 hover:bg-blue-200" : ""}`}
        >
          {props.text}
        </p>
      </a>
    </Link>
  );
};
