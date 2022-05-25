import React, { createContext, useContext, useEffect, useReducer } from "react";
import { initialState } from "../data/initialState";
import { GraphAction, IGraph, Path } from "../model/graph";

const reducer = (graph: IGraph, action: GraphAction): IGraph => {
  const newGraph = action(graph);
  validateGraph(graph, newGraph);
  return newGraph;
};

const assert = (condition: boolean, message: string, oldGraph: IGraph, graph: IGraph): void => {
  if (!condition) {
    console.log("Assertion Error! Here's the graph pre-fail: ");
    console.log(oldGraph.toString());
    console.log("Assertion Message: " + message + "\n here's the graph when it failed:");
    console.log(graph.toString());
    throw new Error("Assertion failed: " + message);
  }
};

const validateGraph = (oldGraph: IGraph, graph: IGraph): void => {
  graph.locatedBlocks.forEach((locatedBlock) => {
    const content = graph.blockContents.get(locatedBlock.contentId);
    const parent = graph.blockContents.get(locatedBlock.parentId);
    if (locatedBlock.archived) {
      if (parent) {
        assert(
          !parent.childLocatedBlocks.includes(locatedBlock.id),
          `archived locatedBlock ${locatedBlock.id} parent still recognizes it`,
          oldGraph,
          graph
        );
      }
      if (content) {
        assert(
          !content.childLocatedBlocks.length,
          `archived locatedBlock ${locatedBlock.id} content still recognizes it`,
          oldGraph,
          graph
        );
      }
    } else {
      assert(!!content, `block content not found for location ${locatedBlock.id}`, oldGraph, graph);
      assert(
        content.locatedBlocks.includes(locatedBlock.id),
        `non-archived locatedBlock ${locatedBlock.id} not found in it's content`,
        oldGraph,
        graph
      );
      if (locatedBlock.leftId) {
        const leftBlock = graph.locatedBlocks.get(locatedBlock.leftId);
        assert(
          !leftBlock.archived,
          `non-archived locatedBlock ${locatedBlock.id} has archived left ${leftBlock.id}`,
          oldGraph,
          graph
        );
        assert(
          locatedBlock.parentId === leftBlock.parentId,
          `left block ${locatedBlock.leftId} has different parent than ${locatedBlock.id}`,
          oldGraph,
          graph
        );
        assert(
          parent.childLocatedBlocks.includes(locatedBlock.id),
          `parent block ${locatedBlock.parentId} does not contain ${locatedBlock.id}`,
          oldGraph,
          graph
        );
        assert(
          parent.getLeftmostChildId() !== locatedBlock.id,
          `${locatedBlock.id} is the leftmost child of ${locatedBlock.parentId} but does not have leftId of null`,
          oldGraph,
          graph
        );
      } else if (parent) {
        assert(
          parent.getLeftmostChildId() === locatedBlock.id,
          `${locatedBlock.id} is not the leftmost child of ${locatedBlock.parentId} but has leftId of null`,
          oldGraph,
          graph
        );
      }
    }
  });
  graph.blockContents.forEach((blockContent) => {
    assert(
      blockContent.locatedBlocks.length > 0,
      `block content ${blockContent.id} has no located blocks`,
      oldGraph,
      graph
    );
  });
};

export const GraphContext = createContext(null);

export interface IGraphContextWrapperProps {
  children: JSX.Element;
  rootContentId: string;
  rootRelativePath: Path;
  focusPath: Path;
  isFocusSpecifiedInURL: boolean;
}

export const GraphContextWrapper = (props: IGraphContextWrapperProps) => {
  const newInitialState = initialState.setPaths(
    props.rootContentId,
    props.rootRelativePath,
    props.focusPath,
    props.isFocusSpecifiedInURL
  );
  const [graphState, graphDispatch]: [
    graphState: IGraph,
    graphDispatch: React.Dispatch<GraphAction>
  ] = useReducer<React.Reducer<IGraph, GraphAction>>(reducer, newInitialState);
  useEffect(() => {
    graphDispatch((state: IGraph): IGraph => {
      const newState = state.setPaths(
        props.rootContentId,
        props.rootRelativePath,
        props.focusPath,
        props.isFocusSpecifiedInURL
      );
      return newState;
    });
  }, [props]);
  return (
    <GraphContext.Provider value={{ state: graphState, dispatch: graphDispatch }}>
      {props.children}
    </GraphContext.Provider>
  );
};
