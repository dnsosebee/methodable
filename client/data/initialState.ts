import { graphFromJson } from "../model/graph/graph";

const json = JSON.stringify(require("./initialState.json"));
export const initialGraphState = graphFromJson(json);
