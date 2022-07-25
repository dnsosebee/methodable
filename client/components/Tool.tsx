import Link from "next/link";
import FourOhFour from "../../pages/404";
import { createView, getLink, IViewData, MODE } from "../model/view";
import { Editor } from "./editor/Editor";
import { EditorProvider } from "./editor/EditorProvider";
import { Guide } from "./guide/Guide";
import { ViewProvider } from "./ViewProvider";

export const getChildComponent = (mode: string) => {
  switch (mode) {
    case MODE.EDIT:
      return (
        <EditorProvider>
          <Editor showSearch={true} showOptions={true} shortenWrapper={true} />
        </EditorProvider>
      );
    case MODE.GUIDE:
      return <Guide shortenWrapper={true} />;
    default:
      return <FourOhFour />;
  }
};

// renaming this file, along with auto-ordering of imports, breaks webpack :/ hence component has different name than file.
export const Tool = (props: IViewData) => {
  const activeClasses = "text-sm py-0.5 px-2 bg-blue-200 rounded-xl shadow-lg";
  const inactiveClasses = "text-slate-600 text-sm py-0.5 px-2 rounded-xl";
  const buttonClasses =
    "flex border border-slate-400 rounded-2xl mb-2 p-1 bg-slate-400 hover:bg-slate-500 shadow-lg";
  return (
    <ViewProvider {...props} redirectToUrl={true}>
      <div className="flex flex-col max-h-full">
        <div className="flex">
          <Link href="/">
            <button className="text-2xl font-bold font-sans mb-2 hover:underline text-black italic">
              Methodable
            </button>
          </Link>
          <div className="flex-grow"></div>
          {props.mode === "edit" ? (
            <Link href={getLink(createView({ ...props }), { mode: MODE.GUIDE })}>
              <button className={buttonClasses}>
                <p className={activeClasses}>Editor mode</p>
                <p className={inactiveClasses}>Guide mode</p>
              </button>
            </Link>
          ) : (
            <Link href={getLink(createView({ ...props }), { mode: MODE.EDIT })}>
              <button className={buttonClasses}>
                <p className={inactiveClasses}>Editor mode</p>
                <p className={activeClasses}>Guide mode</p>
              </button>
            </Link>
          )}
        </div>
        {getChildComponent(props.mode)}
      </div>
    </ViewProvider>
  );
};
