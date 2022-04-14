// a temp file for initial state
import { IState } from "../model/state/stateTypes";

export const initialState: IState = {
    selectionRange: { start: [], end: [] },
    isSelectionActive: false,
    rootBlock: {
    index: [],
    humanText: "root",
    selected: false,
    children: [
      {
        index: [0],
        humanText: "child1",
        selected: false,
        children: [
          {
            index: [0, 0],
            humanText: "grandchild1",
            selected: false,
            children: [],
            id: "grandchild1",
          },
          {
            index: [0, 1],
            humanText: "grandchild2",
            selected: false,
            children: [],
            id: "grandchild2",
          },
          {
            index: [0, 2],
            humanText: "grandchild3",
            selected: false,
            children: [],
            id: "grandchild3",
          },
        ],
        id: "child1",
      },
      {
        index: [1],
        humanText: "child2",
        selected: false,
        children: [
          {
            index: [1, 0],
            humanText: "grandchild4",
            selected: false,
            children: [],
            id: "grandchild4",
          },
          {
            index: [1, 1],
            humanText: "grandchild5",
            selected: false,
            children: [],
            id: "grandchild5",
          },
          {
            index: [1, 2],
            humanText: "grandchild6",
            selected: false,
            children: [],
            id: "grandchild6",
          },
        ],
        id: "child2",
      },
      {
        index: [2],
        humanText: "child3",
        selected: false,
        children: [
          {
            index: [2, 0],
            humanText: "grandchild7",
            selected: false,
            children: [],
            id: "grandchild7",
          },
          {
            index: [2, 1],
            humanText: "grandchild8",
            selected: false,
            children: [],
            id: "grandchild8",
          },
          {
            index: [2, 2],
            humanText: "grandchild9",
            selected: false,
            children: [],
            id: "grandchild9",
          },
        ],
        id: "child3",
      },
    ],
    id: "root",
  },
};
