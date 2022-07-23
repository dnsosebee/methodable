import { List } from "immutable";
import { NoSuchBlockError } from "../../lib/errors";
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
  continuationPath: Path;
  contextElements: List<JSX.Element>;
  workspaceElements: List<JSX.Element>;
}

export interface IVerbPageProps extends IGuidePageProps {
  children: JSX.Element; // workspaces
  controlFlowChildBlocks: List<IFullBlock>;
  hasControlFlowChildren: boolean;
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

export const getChildLists = (
  content: IBlockContent,
  graphState: IGraph
): { workspaceChildBlocks: List<IFullBlock>; controlFlowChildBlocks: List<IFullBlock> } => {
  let controlFlowChildBlocks = List<IFullBlock>();
  let workspaceChildBlocks = List<IFullBlock>();
  content.childLocatedBlocks.forEach((childBlockId) => {
    const childBlock = fullBlockFromLocatedBlockId(graphState, childBlockId);
    if (childBlock.blockContent.verb.isWorkspace()) {
      workspaceChildBlocks = workspaceChildBlocks.push(childBlock);
    } else {
      controlFlowChildBlocks = controlFlowChildBlocks.push(childBlock);
    }
  });
  return { controlFlowChildBlocks, workspaceChildBlocks };
};

export const GuidePage = (props: IGuidePageProps) => {
  const { graphState } = useGraph();
  const { viewState } = useView();
  const { path, continuationPath, contextElements, parentVerb } = props;
  let { workspaceElements } = props;
  let content: IBlockContent;
  try {
    content = getContentFromPath(graphState, viewState, { focusPath: path });
  } catch (e) {
    if (e instanceof NoSuchBlockError) {
      return (
        <div>{`Loading... if this page persists for more than a second, then you are viewing a non-existant guide page.`}</div>
      );
    }
    throw e;
  }

  if (content.verb.isWorkspace()) {
    return (
      <>
        <p className="bg-blue-200 rounded-xl shadow p-2 mb-5 font-sans">
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

  const { controlFlowChildBlocks, workspaceChildBlocks } = getChildLists(content, graphState);
  // update workspaces
  workspaceElements = workspaceChildBlocks
    .map((child) => (
      <child.blockContent.verb.getWorkspace
        {...{
          path: path.push(child.locatedBlock.id),
          key: child.locatedBlock.id,
        }}
      />
    ))
    .concat(workspaceElements);

  if (path.size < viewState.focusPath.size && !content.verb.isTerminal()) {
    // recursively render, appending a new context to the contextElements
    // except we don't push through workspaces: always quit recursing at the workspace, anything more is undefined behavior
    const contextComponent = (
      <content.verb.getContext
        {...{ viewState, path, content, parentVerb }}
        key={`context-line: ${path.last()}`}
      />
    );
    const pathToNext = viewState.focusPath.slice(0, path.size + 1);
    const childId = pathToNext.last();
    // might rethink this later
    let childContinuationPath;
    if (controlFlowChildBlocks.isEmpty()) {
      // this should only come into play when previewing weird things
      childContinuationPath = continuationPath;
    } else {
      childContinuationPath = content.verb.getChildContinuationPath(
        graphState,
        path,
        controlFlowChildBlocks,
        childId,
        continuationPath
      );
    }
    return (
      <GuidePage
        {...{
          path: pathToNext,
          continuationPath: childContinuationPath,
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
      <ShowContext key={`full-context: ${path.last()}`}>{contextElements}</ShowContext>
      <content.verb.getPage
        {...{
          ...props,
          controlFlowChildBlocks: controlFlowChildBlocks,
          hasControlFlowChildren: !controlFlowChildBlocks.isEmpty(),
          content,
        }}
        key={`verb-page: ${path.last()}`}
      >
        <>{workspaceElements}</>
      </content.verb.getPage>
    </>
  );
};
