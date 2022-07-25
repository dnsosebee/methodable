import { VERB } from "../../../model/verbs/verb";
import { MODE } from "../../../model/view";
import { BeginButton } from "../buttons/BeginButton";
import { ContinueButton } from "../buttons/ContinueButton";
import { ContextLine } from "../ContextLine";
import { IVerbContextProps, IVerbPageProps } from "../GuidePage";
import { useGuide } from "../GuideProvider";
import { RichifiedText } from "../RichifiedText";

export const ChooseContext = (props: IVerbContextProps) => {
  const { parentVerb, viewState, path, content } = props;
  let pre: string;
  switch (parentVerb.name) {
    case VERB.UNDEFINED:
      pre = "You started with a choice, ";
      break;
    case VERB.CHOOSE:
      pre = "You chose the choice ";
      break;
    default:
      pre = "You had a choice ";
  }
  return (
    <ContextLine
      {...{ pre, partialView: { mode: MODE.GUIDE, focusPath: path }, text: content.humanText }}
    ></ContextLine>
  );
};

export const ChoosePage = (props: IVerbPageProps) => {
  const {
    controlFlowChildBlocks,
    hasControlFlowChildren,
    parentVerb,
    content,
    path,
    continuationPath,
    children: workspaces,
  } = props;
  const { guideState } = useGuide();
  const { showContext } = guideState;

  let pre: string;
  switch (parentVerb.name) {
    // case VERB.CHOOSE:
    //   pre = "You chose ";
    //   break;
    default:
      pre = "Choose: ";
  }

  return (
    <>
      <p className="text-xl p-1 ml-5">
        {showContext && <span className="text-gray-400">{pre}</span>}
        <span className="">
          <RichifiedText text={content.humanText} />
        </span>
      </p>
      {workspaces}
      <div className="flex-grow mt-5"></div>
      {hasControlFlowChildren ? (
        <div className="flex flex-col">
          {controlFlowChildBlocks.map((child, index) => (
            <BeginButton
              {...{
                text: `${index + 1}. ${child.blockContent.humanText}`,
                highlight: true,
                key: child.locatedBlock.id,
                content: child.blockContent,
                path: path.push(child.locatedBlock.id),
                center: true,
              }}
            />
          ))}
        </div>
      ) : (
        <ContinueButton
          {...{
            text: "Continue (this guide page is missing options)",

            center: true,
            key: "continue",
            highlight: !hasControlFlowChildren,
            continuationPath,
          }}
        />
      )}
    </>
  );
};
