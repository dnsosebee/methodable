import { List } from "immutable";
import { getContentFromPath } from "../../../model/graphWithView";
import { VERB } from "../../../model/verbs/verb";
import { getLink, IView, MODE } from "../../../model/view";
import { Editor } from "../../editor/Editor";
import { useGraph } from "../../GraphProvider";
import { useView, ViewProvider } from "../../ViewProvider";
import { ContextLine } from "../ContextLine";
import { IVerbContextProps, IWorkspaceProps } from "../GuidePage";

export const EditContext = (props: IVerbContextProps) => {
  const { parentVerb, viewState, path, content } = props;
  let pre: string;
  switch (parentVerb.name) {
    case VERB.UNDEFINED:
      pre = "You are editing ";
      break;
    case VERB.CHOOSE:
      pre = "You chose to edit "; // TODO this might be wacky
      break;
    // case VERB.READ:
    //   pre = "Within the section ";
    //   break;
    default:
      pre = "You are within the reading page ";
  }
  let href = getLink(viewState, { mode: MODE.GUIDE, focusPath: path });
  return <ContextLine {...{ pre, href, text: content.humanText }}></ContextLine>;
};

export const EditWorkspace = (props: IWorkspaceProps) => {
  const { path } = props;
  const { graphState } = useGraph();
  const { viewState } = useView();
  const content = getContentFromPath(graphState, viewState, { focusPath: path });
  const editors: List<JSX.Element> = content.childLocatedBlocks.map((childId) => {
    const childLocation = graphState.locatedBlocks.get(childId);
    const view = {
      mode: MODE.EDIT,
      rootContentId: childLocation.contentId,
      rootRelativePath: List(),
      focusPath: List(),
      focusPosition: "end",
    } as IView;
    return (
      <>
        <p className="ml-5 italic text-gray-400">{content.humanText}</p>
        <ViewProvider {...view}>
          <Editor />
        </ViewProvider>
      </>
    );
  });
  return <>{editors}</>;
};
