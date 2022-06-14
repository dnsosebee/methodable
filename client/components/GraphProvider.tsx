import React, { createContext, useReducer } from "react";
import { initialGraphState } from "../data/initialState";
import { isDev } from "../lib/helpers";
import { logTime } from "../lib/loggers";
import { graphFromJson, graphToJson, IGraph } from "../model/graph/graph";

export type GraphAction = (state: Readonly<IGraph>) => IGraph;

const graphReducer = (oldGraph: IGraph, action: GraphAction): IGraph => {
  let oldTime = Date.now();
  const graph = action(oldGraph);
  let newTime = Date.now();
  logTime("time to take action: " + (newTime - oldTime));
  oldTime = newTime;
  try {
    validateGraph(oldGraph, graph);
  } catch (e) {
    if (isDev()) {
      throw e;
    } else {
      alert(
        "Sorry, we were unable to process that command. You may close this popup to continue. If you'd like help with this problem, please send the developer a copy of the message below:\n\n" +
          e
      );
      return oldGraph;
    }
  }
  newTime = Date.now();
  logTime("time to validate graph: " + (newTime - oldTime));
  oldTime = newTime;
  localStorage.setItem("graph", graphToJson(graph));
  newTime = Date.now();
  logTime("time to save graph: " + (newTime - oldTime));
  oldTime = newTime;
  return graph;
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
          `archived locatedBlock ${locatedBlock.id} parent ${parent.id} still recognizes it`,
          oldGraph,
          graph
        );
      }
      if (content) {
        assert(
          !content.childLocatedBlocks.includes(locatedBlock.id),
          `archived locatedBlock ${locatedBlock.id} content ${content.id} still recognizes it`,
          oldGraph,
          graph
        );
      }
    } else {
      assert(!!content, `block content not found for location ${locatedBlock.id}`, oldGraph, graph);
      assert(
        locatedBlock.parentId === null || !!parent,
        `LocatedBlock ${locatedBlock.id} has a parentId ${locatedBlock.parentId} that doesn't exist in the graph`,
        oldGraph,
        graph
      );
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
          !!parent,
          `non-archived locatedBlock ${locatedBlock.id} with leftId ${locatedBlock.leftId} must have parent in graph. Parent is ${locatedBlock.parentId}.`,
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
      blockContent.locatedBlocks.size > 0,
      `block content ${blockContent.id} has no located blocks`,
      oldGraph,
      graph
    );
    blockContent.childLocatedBlocks.forEach((locatedBlockId) => {
      const locatedBlock = graph.locatedBlocks.get(locatedBlockId);
      assert(
        !!locatedBlock,
        `locatedBlock ${locatedBlockId} not found in graph desipte being child of block content ${blockContent.id}`,
        oldGraph,
        graph
      );
      assert(
        locatedBlock.parentId === blockContent.id,
        `locatedBlock ${locatedBlockId} has parentId ${locatedBlock.parentId} but block content ${blockContent.id} has it as child`,
        oldGraph,
        graph
      );
    });
  });
};

export const graphContext = createContext<IGraphContext>(null);

export type IGraphContext = { graphState: IGraph; graphDispatch: React.Dispatch<GraphAction> };

export const useGraph = (): IGraphContext => {
  const context = React.useContext(graphContext);
  if (context === undefined) {
    throw new Error("useGraph must be used within a GraphProvider");
  }
  return context;
};

export interface IGraphProviderProps {
  children: JSX.Element;
}

export const GraphProvider = (props: IGraphProviderProps) => {
  const storedState = localStorage.getItem("graph");
  const initialState = storedState
    ? graphFromJson(storedState, initialGraphState)
    : initialGraphState;
  const [graphState, graphDispatch] = useReducer<React.Reducer<IGraph, GraphAction>>(
    graphReducer,
    initialState
  );

  return (
    <graphContext.Provider value={{ graphState, graphDispatch }}>
      {props.children}
    </graphContext.Provider>
  );
};
