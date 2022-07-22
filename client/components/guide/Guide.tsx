import { List } from "immutable";
import { IGraph } from "../../model/graph/graph";
import { LocatedBlockId } from "../../model/graph/locatedBlock";
import { getContentFromPath } from "../../model/graphWithView";
import { createVerb, VERB } from "../../model/verbs/verb";
import { IView } from "../../model/view";
import { useGraph } from "../GraphProvider";
import { useView } from "../ViewProvider";
import { Wrapper } from "../Wrapper";
import { Entry } from "./Entry";
import { GuidePage, IGuidePageProps } from "./GuidePage";
import { GuideProvider } from "./GuideProvider";

export interface IGuideProps {
  graphState?: IGraph;
  viewState?: IView;
  shortenWrapper?: boolean;
}

export const Guide = (props: IGuideProps) => {
  const graphState: IGraph = props.graphState ? props.graphState : useGraph().graphState;
  const viewState: IView = props.viewState ? props.viewState : useView().viewState;
  const { focusPath } = viewState;
  const programContent = getContentFromPath(graphState, viewState, {});
  const programVerb = programContent.verb;
  const continuationPath = List<LocatedBlockId>();

  const guidePageProps: IGuidePageProps = {
    parentVerb: createVerb(VERB.UNDEFINED),
    path: List(),
    continuationPath,
    contextElements: List(),
    workspaceElements: List(),
  };
  return (
    <GuideProvider>
      <Wrapper
        shouldGrow={true}
        maxHClass={props.shortenWrapper ? "max-h-[calc(100%_-_40px)]" : "max-h-full"}
      >
        <div className="flex-grow flex flex-col m-2 overflow-auto font-serif">
          {focusPath ? (
            <GuidePage {...guidePageProps} key="program" />
          ) : (
            <Entry content={getContentFromPath(graphState, viewState, {})}></Entry>
          )}
        </div>
      </Wrapper>
    </GuideProvider>
  );
};
