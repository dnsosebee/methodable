import { graphFromJson } from "../model/graph/graph";

export const initialGraphJson = JSON.stringify(require("./initialState.json"));
export const initialGraphState = graphFromJson(initialGraphJson);
