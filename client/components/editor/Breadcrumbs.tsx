import { BlockContentId } from "../../model/graph/blockContent";
import { Path } from "../../model/graph/graph";
import { getContentFromPath } from "../../model/graphWithView";
import { IView, MODE } from "../../model/view";
import { useGraph } from "../GraphProvider";
import { useView } from "../ViewProvider";

export interface IBreadcrumbsProps {
  rootContentId: BlockContentId;
  rootRelativePath: Path; // includes the last element that doesn't get rendered as breadcrumb
}

interface IBreadcrumbInfo {
  text: string;
  partialView: Partial<IView>;
}

const MAX_LENGTH_OF_BREADCRUMB_TEXT = 40;

export const Breadcrumbs = (props: IBreadcrumbsProps) => {
  const { graphState } = useGraph();
  const { viewState, RedirectView } = useView();

  const getBreadcrumbInfos = (relativePath: Path): IBreadcrumbInfo[] => {
    const content = getContentFromPath(graphState, viewState, {
      rootRelativePath: relativePath,
    });
    let text = content.humanText;
    if (text.length > MAX_LENGTH_OF_BREADCRUMB_TEXT) {
      text = text.substring(0, MAX_LENGTH_OF_BREADCRUMB_TEXT - 3) + "...";
    }
    const info: IBreadcrumbInfo = {
      text,
      partialView: { mode: MODE.EDIT, rootRelativePath: relativePath },
    };
    if (relativePath.size === 0) {
      return [info];
    }
    return [...getBreadcrumbInfos(relativePath.slice(0, -1)), info];
  };

  const breadcrumbInfos =
    props.rootRelativePath.size > 0 ? getBreadcrumbInfos(props.rootRelativePath.slice(0, -1)) : [];
  return (
    <div className="flex mb-2 h-5">
      {breadcrumbInfos.map((info, index) => {
        return (
          <span key={index} className="flex flex-none">
            {" "}
            <div className="select-none text-xs text-gray-500 rounded py-0.5 px-1 bg-gray-100 hover:bg-gray-200">
              <RedirectView partialView={info.partialView}>
                <span>{info.text}</span>
              </RedirectView>{" "}
            </div>
            <p className="mx-2 text-xs py-0.5 text-gray-500 select-none">
              {index < breadcrumbInfos.length - 1 ? "❯" : ""}
            </p>
          </span>
        );
      })}
    </div>
  );
};
