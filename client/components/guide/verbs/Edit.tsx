import { List } from "immutable";
import { memo } from "react";
import { blockContentsAreEqual, IBlockContent } from "../../../model/graph/blockContent";
import { getContentFromPath } from "../../../model/graphWithView";
import { VERB } from "../../../model/verbs/verb";
import { getLink, IView, MODE, viewsAreEqual } from "../../../model/view";
import { Editor } from "../../editor/Editor";
import { EditorProvider } from "../../editor/EditorProvider";
import { useGraph } from "../../GraphProvider";
import { useView, ViewProvider } from "../../ViewProvider";
import { ContextLine } from "../ContextLine";
import { IVerbContextProps, IWorkspaceProps } from "../GuidePage";
import { RichifiedText } from "../RichifiedText";

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
      focusPath: null,
      focusPosition: "end",
    } as IView;
    return (
      <InnerEditWorkspace {...{ view, content }} key={`edit-workspace: ${view.rootContentId}`} />
    );
  });
  return <>{editors}</>;
};

interface IInnerEditWorkspaceProps {
  view: IView;
  content: IBlockContent;
}

const shouldMemo = (prevProps: IInnerEditWorkspaceProps, nextProps: IInnerEditWorkspaceProps) => {
  return (
    viewsAreEqual(prevProps.view, nextProps.view) &&
    blockContentsAreEqual(prevProps.content, nextProps.content)
  );
};

const InnerEditWorkspace = memo((props: IInnerEditWorkspaceProps) => {
  const { view, content } = props;
  return (
    <div className="mt-5">
      <p className="ml-5 italic text-gray-400">
        <RichifiedText text={content.humanText} />
      </p>
      <ViewProvider {...view} redirectToUrl={false}>
        <EditorProvider>
          <Editor showOptions={true} showSearch={false} />
        </EditorProvider>
      </ViewProvider>
    </div>
  );
}, shouldMemo);
