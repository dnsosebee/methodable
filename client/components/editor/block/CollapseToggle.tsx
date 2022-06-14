// a component that's a button that links to the page to run the current block
export interface ICollapseToggleProps {
  collapsed: boolean;
  visible: boolean;
  onToggle: () => void;
}

export const CollapseToggle = (props: ICollapseToggleProps) => {
  const classes = `w-3 text-xs text-gray-700 rounded select-none flex-none pt-0.5 ${
    props.visible ? "hover:bg-gray-100" : ""
  } ${props.collapsed ? "text-gray-700" : "text-gray-200"}`;

  return (
    <>
      {props.visible ? (
        <p className={classes} onClick={props.onToggle}>
          {props.collapsed ? "▶︎" : "▼"}
        </p>
      ) : (
        <div className={classes}></div>
      )}
    </>
  );
};
