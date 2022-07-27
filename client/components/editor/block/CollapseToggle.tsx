// a component that's a button that links to the page to run the current block
export interface ICollapseToggleProps {
  collapsed: boolean;
  visible: boolean;
  onToggle: () => void;
}

export const CollapseToggle = (props: ICollapseToggleProps) => {
  const classes = `w-4 text-xs rounded-lg select-none flex-none pt-0.5 flex flex-col ${
    props.visible ? "hover:bg-gray-100" : ""
  } ${props.collapsed ? "text-gray-700" : "text-gray-300"}`;

  return (
    <>
      {props.visible ? (
        <button className={classes} onClick={props.onToggle}>
          <span className="self-center mt-1">{props.collapsed ? "▶︎" : "▼"}</span>
        </button>
      ) : (
        <div className={classes}></div>
      )}
    </>
  );
};
