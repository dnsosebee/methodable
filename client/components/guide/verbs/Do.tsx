import { VERB } from "../../../model/verbs/verb";
import { getLink, MODE } from "../../../model/view";
import { useGraph } from "../../GraphProvider";
import { useView } from "../../ViewProvider";
import { ContextLine } from "../ContextLine";
import { GuideButton } from "../GuideButton";
import { IVerbContextProps, IVerbPageProps } from "../GuidePage";
import { useGuide } from "../GuideProvider";

export const DoContext = (props: IVerbContextProps) => {
  const { parentVerb, viewState, path, content } = props;
  let pre: string;
  switch (parentVerb.name) {
    case VERB.UNDEFINED:
      pre = "You are following the program ";
      break;
    case VERB.CHOOSE:
      pre = "You chose ";
      break;
    default:
      pre = "You began the subgoal ";
  }
  let post: string;
  switch (parentVerb.name) {
    case VERB.UNDEFINED:
      post = ". As part of that program,";
      break;
    case VERB.CHOOSE:
      post = ", which you're working through now.";
      break;
    default:
      post = ".";
  }
  let href = getLink(viewState, { mode: MODE.GUIDE, focusPath: path });
  return <ContextLine {...{ pre, href, post, text: content.humanText }}></ContextLine>;
};

export const DoPage = (props: IVerbPageProps) => {
  const {
    childBlocks,
    hasChildren,
    parentVerb,
    content,
    path,
    viewAfterCompletion,
    children: workspaces,
  } = props;
  const { graphState } = useGraph();
  const { viewState } = useView();
  const { guideState, guideDispatch } = useGuide();
  const { showSubtasks } = guideState;

  const toggleSubtasks = () => {
    guideDispatch((state) => state.toggleSubtasks());
  };

  let pre: string;
  switch (parentVerb.name) {
    case VERB.UNDEFINED:
      pre = "This is a guide to ";
      break;
    // case VERB.CHOOSE:
    //   pre = "You chose ";
    //   break;
    default:
      pre = hasChildren ? "Your goal is to " : "Do this: ";
  }

  return (
    <>
      <div className=" p-1 ml-5">
        <p className="text-xl font-bold mb-5">
          <span className="text-gray-400">{pre}</span>
          <span className="bg-yellow-200">{content.humanText}</span>
          {/* {hasChildren ? <span className="text-gray-400">.</span> : null} */}
        </p>
        {workspaces}
      </div>
      {hasChildren ? (
        <div className="ml-10 mt-5 flex-1 flex flex-col">
          <button
            className="italic text-gray-300 hover:bg-gray-100 text-left w-full"
            onClick={toggleSubtasks}
          >
            {showSubtasks ? "▼ hide " : "▶︎ show "} {childBlocks.size} guided subtasks
          </button>
          {showSubtasks ? (
            <>
              {childBlocks.map((child, index) => (
                <GuideButton
                  {...{
                    text: `${index + 1}. ${child.blockContent.humanText}`,
                    href: getLink(viewState, {
                      mode: MODE.GUIDE,
                      focusPath: path.push(child.locatedBlock.id),
                    }),
                    key: child.locatedBlock.id,
                  }}
                />
              ))}
            </>
          ) : null}
        </div>
      ) : null}
      <div className="flex-grow"></div>
      {hasChildren ? (
        <GuideButton
          {...{
            text: "begin guided subtasks",
            href: getLink(
              viewState,
              content.verb.getNextView(graphState, childBlocks, path, null, viewAfterCompletion)
            ),
            center: true,
            highlight: true,
            key: "begin",
          }}
        />
      ) : null}
      <GuideButton
        {...{
          text: hasChildren ? "proceed to next goal" : "proceed to next step",
          href: getLink(viewState, viewAfterCompletion),
          center: true,
          key: "proceed",
          highlight: !hasChildren,
        }}
      />
    </>
  );
};
