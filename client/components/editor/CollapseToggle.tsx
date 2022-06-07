import Link from "next/link";
import { BlockContentId } from "../../model/blockContent";

// a component that's a button that links to the page to run the current block
export interface ICollapseToggleProps {
  collapsed: boolean;
  visible: boolean;
  onToggle: () => void;
}

export const CollapseToggle = (props: ICollapseToggleProps) => {
  const classes = `h-5 w-3 text-xs text-gray-700 rounded select-none flex-none mt-0.5 ${
    props.visible ? "hover:bg-gray-100" : ""
  } ${props.collapsed ? "text-gray-700" : "text-gray-200"}`;

  return (
    <>
      {props.visible ? (
        <button className={classes} onClick={props.onToggle}>
          {props.collapsed ? "▶︎" : "▼"}
        </button>
      ) : (
        <div className={classes}> </div>
      )}
    </>
  );
};
