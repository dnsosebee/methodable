import { VERB } from "../../../model/verbs/verb";
import { MODE } from "../../../model/view";
import { useView } from "../../ViewProvider";
import { BeginButton } from "../buttons/BeginButton";
import { ContinueButton } from "../buttons/ContinueButton";
import { GuideButton } from "../buttons/GuideButton";
import { ContextLine } from "../ContextLine";
import { IVerbContextProps, IVerbPageProps } from "../GuidePage";
import { useGuide } from "../GuideProvider";
import { RichifiedText } from "../RichifiedText";

export const AnswerContext = (props: IVerbContextProps) => {
  const { parentVerb, viewState, path, content } = props;
  let pre: string;
  switch (parentVerb.name) {
    case VERB.CHOOSE:
      pre = "You answered ";
      break;
    default:
      pre = "You answered ";
  }
  return (
    <ContextLine
      {...{ pre, partialView: { focusPath: path }, text: content.humanText }}
    ></ContextLine>
  );
};

export const AnswerPage = (props: IVerbPageProps) => {
  const {
    controlFlowChildBlocks,
    hasControlFlowChildren,
    parentVerb,
    content,
    path,
    continuationPath,
    children: workspaces,
  } = props;
  const { viewState } = useView();
  const { guideState, guideDispatch } = useGuide();
  const { showSubtasks, showContext } = guideState;

  const toggleSubtasks = () => {
    guideDispatch((state) => state.toggleSubtasks());
  };

  let pre: string = "You answered: ";

  return (
    <>
      <div className=" p-1 ml-5">
        <p className="text-xl mb-5">
          {showContext && <span className="text-gray-400">{pre}</span>}
          <span className="">
            <RichifiedText text={content.humanText} />
          </span>
        </p>
        {workspaces}
      </div>
      {hasControlFlowChildren ? (
        <div className="ml-10 mt-5 flex-1 flex flex-col">
          <button
            className="italic text-gray-300 hover:bg-slate-200 py-1 px-2 rounded-lg text-left w-full mb-2"
            onClick={toggleSubtasks}
          >
            {showSubtasks ? "▼ hide " : "▶︎ show "} {controlFlowChildBlocks.size} guided subtasks
          </button>
          {showSubtasks ? (
            <>
              {controlFlowChildBlocks.map((child, index) => (
                <GuideButton
                  {...{
                    text: `${index + 1}. ${child.blockContent.humanText}`,
                    partialView: {
                      mode: MODE.GUIDE,
                      focusPath: path.push(child.locatedBlock.id),
                    },
                    key: child.locatedBlock.id,
                  }}
                />
              ))}
            </>
          ) : null}
        </div>
      ) : null}
      <div className="flex-grow mt-5"></div>
      {hasControlFlowChildren ? (
        <BeginButton
          {...{
            text: "begin guided subtasks",
            center: true,
            highlight: true,
            content,
            path,
            key: "begin",
          }}
        />
      ) : null}
      <ContinueButton
        {...{
          text: "Continue",
          center: true,
          highlight: !hasControlFlowChildren,
          continuationPath,
          key: "continue",
        }}
      />
    </>
  );
};
