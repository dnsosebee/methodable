import { IGraph, Path } from "../../../model/graph/graph";
import { getContentFromPath } from "../../../model/graphWithView";
import { VERB } from "../../../model/verbs/verb";
import { getLink, IView, MODE } from "../../../model/view";
import { useGraph } from "../../GraphProvider";
import { useView } from "../../ViewProvider";
import { ContinueButton } from "../buttons/ContinueButton";
import { ContextLine } from "../ContextLine";
import { IVerbContextProps, IVerbPageProps } from "../GuidePage";
import { useGuide } from "../GuideProvider";

export const ReadContext = (props: IVerbContextProps) => {
  const { parentVerb, viewState, path, content } = props;
  let pre: string;
  switch (parentVerb.name) {
    case VERB.UNDEFINED:
      pre = "You are inside the reading page ";
      break;
    case VERB.CHOOSE:
      pre = "You chose ";
      break;
    case VERB.READ:
      pre = "Within the section ";
      break;
    default:
      pre = "You are within the reading page ";
  }
  let href = getLink(viewState, { mode: MODE.GUIDE, focusPath: path });
  return <ContextLine {...{ pre, href, text: content.humanText }}></ContextLine>;
};

export const ReadPage = (props: IVerbPageProps) => {
  const { graphState } = useGraph();
  const { viewState } = useView();
  const { guideState } = useGuide();
  const { showContext } = guideState;
  const { content, path, controlFlowChildBlocks, children: workspaces, continuationPath } = props;

  let pre = "Read: ";

  return (
    <>
      <p className="text-xl font-bold p-1 ml-5">
        {showContext && <span className="text-gray-400">{pre}</span>}
        <span className="">{content.humanText}</span>
      </p>
      {controlFlowChildBlocks.map((child) => (
        <ReadingBlock
          {...{ graphState, viewState, path: path.push(child.locatedBlock.id), depth: 1 }}
        />
      ))}
      {workspaces}
      <div className="flex-grow mt-5"></div>
      <ContinueButton
        {...{
          text: "Continue",
          center: true,
          highlight: true,
          continuationPath,
          key: "continue",
        }}
      />
    </>
  );
};

interface IReadingBlockProps {
  graphState: IGraph;
  viewState: IView;
  path: Path;
  depth: number;
}
const ReadingBlock = (props: IReadingBlockProps) => {
  const { graphState, viewState, path, depth } = props;
  const content = getContentFromPath(graphState, viewState, { focusPath: path });
  const children = content.childLocatedBlocks.map((childId) => (
    <ReadingBlock {...{ graphState, viewState, path: path.push(childId), depth: depth + 1 }} />
  ));
  return (
    <div className="flex flex-col ml-7">
      <div className="flex">
        {depth > 1 ? <p className="mr-1">{"• "}</p> : null}
        <p
          className={`${
            depth == 1
              ? "text-lg mt-2"
              : depth == 2
              ? "mt-1"
              : depth == 3
              ? "text-sm mt-0.5"
              : "text-sm"
          }`}
        >
          {content.humanText}
        </p>
      </div>
      {children}
    </div>
  );
};
