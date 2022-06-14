import { VERB } from "../../../model/verbs/verb";
import { getLink, MODE } from "../../../model/view";
import { useGraph } from "../../GraphProvider";
import { useView } from "../../ViewProvider";
import { ContextLine } from "../ContextLine";
import { GuideButton } from "../GuideButton";
import { IVerbContextProps, IVerbPageProps } from "../GuidePage";

export const ChooseContext = (props: IVerbContextProps) => {
  const { parentVerb, viewState, path, content } = props;
  let pre: string;
  switch (parentVerb.name) {
    case VERB.UNDEFINED:
      pre = "You started with a choice, ";
      break;
    case VERB.CHOOSE:
      pre = "You chose ";
      break;
    default:
      pre = "You had a choice ";
  }
  let href = getLink(viewState, { mode: MODE.GUIDE, focusPath: path });
  return <ContextLine {...{ pre, href, text: content.humanText }}></ContextLine>;
};

export const ChoosePage = (props: IVerbPageProps) => {
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
      <p className="text-xl font-bold p-1 ml-5">
        <span className="text-gray-400">{pre}</span>
        <span className="bg-yellow-200">{content.humanText}</span>
      </p>
      {workspaces}
      <div className="flex-grow"></div>
      {hasChildren ? (
        <div className="flex flex-col">
          {childBlocks.map((child, index) => (
            <GuideButton
              {...{
                text: `${index + 1}. ${child.blockContent.humanText}`,
                href: getLink(viewState, {
                  ...content.verb.getNextView(
                    graphState,
                    childBlocks,
                    path,
                    child.locatedBlock.id,
                    viewAfterCompletion
                  ),
                }),
                key: child.locatedBlock.id,
                highlight: true,
              }}
            />
          ))}
        </div>
      ) : (
        <GuideButton
          {...{
            text: "proceed to next goal (this guide page is missing options)",
            href: getLink(viewState, viewAfterCompletion),
            center: true,
            key: "proceed",
            highlight: !hasChildren,
          }}
        />
      )}
    </>
  );
};
