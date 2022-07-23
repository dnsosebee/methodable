import Link from "next/link";
import { IViewData } from "../model/view";
import { GraphProvider } from "./GraphProvider";

export interface IToolProps extends IViewData {
  children;
}

export const Tool = (props: IToolProps) => {
  const buttonClasses =
    "text-lg font-bold font-sans mb-2 py-0.5 px-2 bg-blue-200 hover:bg-blue-300";
  return (
    <GraphProvider>
      <div className="flex flex-col max-h-full">
        <div className="flex">
          <Link href="/">
            <button className="text-2xl font-bold font-sans mb-2 hover:underline text-black italic">
              Methodable
            </button>
          </Link>
          <div className="flex-grow"></div>
          {/* {props.mode === "edit" ? (
            <Link href={getLink(createView({ ...props }), { mode: MODE.GUIDE })}>
              <button className={buttonClasses}>Mode: Editor</button>
            </Link>
          ) : // <Link href={getLink(createView({ ...props }), { mode: MODE.EDIT })}>
          //   <button className={buttonClasses}>Mode: Guide</button>
          // </Link>
          null} */}
        </div>
        {props.children}
      </div>
    </GraphProvider>
  );
};
