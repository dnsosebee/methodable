import { List } from "immutable";
import { IGraph } from "../../model/graph/graph";
import { getContentFromPath } from "../../model/graphWithView";
import { createVerb, VERB } from "../../model/verbs/verb";
import { IView, MODE, resolveView } from "../../model/view";
import { useGraph } from "../GraphProvider";
import { useView } from "../ViewProvider";
import { Wrapper } from "../Wrapper";
import { Entry } from "./Entry";
import { GuidePage, IGuidePageProps } from "./GuidePage";
import { GuideProvider } from "./GuideProvider";

export interface IGuideProps {
  graphState?: IGraph;
  viewState?: IView;
}

export const Guide = (props: IGuideProps) => {
  const graphState: IGraph = props.graphState ? props.graphState : useGraph().graphState;
  const viewState: IView = props.viewState ? props.viewState : useView().viewState;
  const { focusPath } = viewState;
  const programContent = getContentFromPath(graphState, viewState, {});
  const programVerb = programContent.verb;
  const viewAfterCompletion = resolveView(viewState, { mode: MODE.FINISH });

  const guidePageProps: IGuidePageProps = {
    parentVerb: createVerb(VERB.UNDEFINED),
    path: List(),
    viewAfterCompletion,
    contextElements: List(),
    workspaceElements: List(),
  };
  return (
    <GuideProvider>
      <Wrapper shouldGrow={true}>
        <div className="flex-grow flex flex-col m-2">
          {focusPath ? (
            <GuidePage {...guidePageProps} key="program" />
          ) : (
            <Entry
              content={getContentFromPath(graphState, viewState, {})}
              viewAfterCompletion={viewAfterCompletion}
            ></Entry>
          )}
        </div>
      </Wrapper>
    </GuideProvider>
  );
};
