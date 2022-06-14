import { List } from "immutable";
import { IBlockContent } from "../../model/graph/blockContent";
import { fullBlockFromLocatedBlockId, IFullBlock } from "../../model/graph/fullBlock";
import { IGraph, Path } from "../../model/graph/graph";
import { getContentFromPath } from "../../model/graphWithView";
import { IVerb } from "../../model/verbs/verb";
import { IView } from "../../model/view";
import { useGraph } from "../GraphProvider";
import { useView } from "../ViewProvider";
import { ShowContext } from "./ShowContext";

export interface IGuidePageProps {
  parentVerb: IVerb;
  path: Path;
  viewAfterCompletion: IView;
  contextElements: List<JSX.Element>;
  workspaceElements: List<JSX.Element>;
}

export interface IVerbPageProps extends IGuidePageProps {
  children: JSX.Element; // workspaces
  childBlocks: List<IFullBlock>;
  hasChildren: boolean;
  content: IBlockContent;
}

export interface IVerbContextProps {
  viewState: IView;
  path: Path;
  content: IBlockContent;
  parentVerb: IVerb;
}

export interface IWorkspaceProps {
  path: Path;
}

const getChildLists = (
  content: IBlockContent,
  graphState: IGraph
): { workspaceChildBlocks: List<IFullBlock>; childBlocks: List<IFullBlock> } => {
  let childBlocks = List<IFullBlock>();
  let workspaceChildBlocks = List<IFullBlock>();
  content.childLocatedBlocks.forEach((childBlockId) => {
    const childBlock = fullBlockFromLocatedBlockId(graphState, childBlockId);
    if (childBlock.blockContent.verb.isWorkspace()) {
      workspaceChildBlocks = workspaceChildBlocks.push(childBlock);
    } else {
      childBlocks = childBlocks.push(childBlock);
    }
  });
  return { childBlocks, workspaceChildBlocks };
};

export const GuidePage = (props: IGuidePageProps) => {
  const { graphState } = useGraph();
  const { viewState } = useView();
  const { path, viewAfterCompletion: viewAfterCompletion, contextElements, parentVerb } = props;
  let { workspaceElements } = props;
  const content = getContentFromPath(graphState, viewState, { focusPath: path });

  if (content.verb.isWorkspace()) {
    return (
      <>
        <p className="bg-blue-200 rounded shadow p-1 mb-5">
          <span className="font-bold">Note:</span> You are viewing a{" "}
          <span className="italic">workspace</span>. Workspaces don't get their own guide pages,
          instead they are included in other pages.
        </p>
        <content.verb.getWorkspace
          {...{
            path: path,
          }}
        />
      </>
    );
  }

  const { childBlocks, workspaceChildBlocks } = getChildLists(content, graphState);
  // update workspaces
  workspaceElements = workspaceElements.concat(
    workspaceChildBlocks.map((child) => (
      <child.blockContent.verb.getWorkspace
        {...{
          path: path.push(child.locatedBlock.id),
          key: child.locatedBlock.id,
        }}
      />
    ))
  );
  if (path.size < viewState.focusPath.size && !content.verb.isTerminal()) {
    // recursively render, appending a new context to the contextElements
    // except we don't push through workspaces: always quit recursing at the workspace, anything more is undefined behavior
    const contextComponent = (
      <content.verb.getContext {...{ viewState, path, content, parentVerb }} key={path.last()} />
    );
    const pathToNext = viewState.focusPath.slice(0, path.size + 1);
    const childId = pathToNext.last();
    const nextContent = getContentFromPath(graphState, viewState, { focusPath: pathToNext });
    const nextVerb = nextContent.verb;
    return (
      <GuidePage
        {...{
          path: pathToNext,
          viewAfterCompletion: content.verb.getNextView(
            graphState,
            childBlocks,
            path,
            childId,
            viewAfterCompletion
          ),
          contextElements: contextElements.concat(contextComponent),
          workspaceElements,
          parentVerb: content.verb,
          key: childId,
        }}
      />
    );
  }

  // finally, render the page for the terminal verb

  return (
    <>
      <ShowContext key={path.last()}>{contextElements}</ShowContext>
      <content.verb.getPage
        {...{ ...props, childBlocks, hasChildren: !childBlocks.isEmpty(), content }}
        key={path.last()}
      >
        <>{workspaceElements}</>
      </content.verb.getPage>
    </>
  );
};
