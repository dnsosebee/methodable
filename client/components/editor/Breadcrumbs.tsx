import Link from "next/link";
import { PATH_DELIMITER } from "../../../pages/[mode]/[rootContentId]";
import { BlockContentId } from "../../model/blockContent";
import { IGraph, Path } from "../../model/graph";
import { useGraphWithPaths } from "../../model/graphWithPaths";
import { useGraph } from "../GraphProvider";

export interface IBreadcrumbsProps {
  rootContentId: BlockContentId;
  rootRelativePath: Path; // includes the last element that doesn't get rendered as breadcrumb
}

interface IBreadcrumbInfo {
  text: string;
  link: string;
}

const MAX_LENGTH_OF_BREADCRUMB_TEXT = 40;

export const Breadcrumbs = (props: IBreadcrumbsProps) => {
  const {graphState, getContentFromPath} = useGraphWithPaths();

  const getBreadcrumbInfos = (relativePath: Path): IBreadcrumbInfo[] => {
    const content = getContentFromPath({ rootRelativePath: relativePath });
    let text = content.humanText;
    if (text.length > MAX_LENGTH_OF_BREADCRUMB_TEXT) {
      text = text.substring(0, MAX_LENGTH_OF_BREADCRUMB_TEXT - 3) + "...";
    }
    const info: IBreadcrumbInfo = {
      text,
      link: `/edit/${props.rootContentId}/${relativePath.join(PATH_DELIMITER)}`,
    };
    if (relativePath.length === 0) {
      return [info];
    }
    return [...getBreadcrumbInfos(relativePath.slice(0, -1)), info];
  };

  const breadcrumbInfos = props.rootRelativePath.length > 0 ? getBreadcrumbInfos(props.rootRelativePath.slice(0, -1)) : [];
  return (
    <div className="flex mb-2 h-5">
      {breadcrumbInfos.map((info, index) => {
        return (
          <span key={index} className="flex flex-none">
            <Link href={info.link}>
              <a className="select-none text-xs text-gray-500 rounded py-0.5 px-1 bg-gray-100 hover:bg-gray-200">
                {info.text}
              </a>
            </Link>
            <p className="mx-2 text-xs py-0.5 text-gray-500 select-none">
              {index < breadcrumbInfos.length - 1 ? "❯" : ""}
            </p>
          </span>
        );
      })}
    </div>
  );
};
