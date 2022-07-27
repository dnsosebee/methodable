export interface IContainerLineProps {
  onClick: () => void;
}

export const ContainerLine = (props: IContainerLineProps) => {
  return (
    <button onClick={props.onClick} className="flex flex-col grow hover:bg-gray-100 rounded-lg">
      <div className={`w-1 mx-2 rounded-sm select-none grow bg-gray-200`} />
    </button>
  );
};
