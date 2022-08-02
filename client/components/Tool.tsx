import { List } from "immutable";
import Link from "next/link";
import FourOhFour from "../../pages/404";
import { getLink, MODE } from "../model/view";
import { Editor } from "./editor/Editor";
import { EditorProvider } from "./editor/EditorProvider";
import { Guide } from "./guide/Guide";
import { Header } from "./Header";
import { useView } from "./ViewProvider";

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

export const Tool = () => {
  const { viewState } = useView();
  const editLink = getLink(viewState, {
    mode: MODE.EDIT,
    rootRelativePath:
      !viewState.focusPath || viewState.focusPath.isEmpty()
        ? viewState.rootRelativePath
        : viewState.rootRelativePath.concat(viewState.focusPath),
  });
  const guideLink = getLink(viewState, {
    mode: MODE.GUIDE,
    rootRelativePath: List(),
    focusPath:
      !viewState.rootRelativePath || viewState.rootRelativePath.isEmpty()
        ? null
        : viewState.rootRelativePath,
  });
  const activeClasses = "text-sm py-0.5 px-2 bg-blue-200 rounded-xl shadow-lg";
  const inactiveClasses = "text-slate-600 text-sm py-0.5 px-2 rounded-xl";
  const buttonClasses =
    "flex border border-slate-400 rounded-2xl mb-2 p-1 bg-slate-400 hover:bg-slate-500 shadow-lg";
  return (
    <div className="flex flex-col max-h-full">
      <Header>
        {viewState.mode === "edit" ? (
          <Link href={guideLink} passHref>
            <button className={buttonClasses}>
              <p className={activeClasses}>Editor mode</p>
              <p className={inactiveClasses}>Guide mode</p>
            </button>
          </Link>
        ) : (
          <Link href={editLink} passHref>
            <button className={buttonClasses}>
              <p className={inactiveClasses}>Editor mode</p>
              <p className={activeClasses}>Guide mode</p>
            </button>
          </Link>
        )}
      </Header>
      {getChildComponent(viewState.mode)}
    </div>
  );
};
