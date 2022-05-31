import { useContext } from "react";
import { IGraph } from "../../model/graph";
import { GraphContext } from "../GraphContextWrapper";
import { Entry } from "./Entry";

export const GuideContainer = () => {
  const { state }: { state: IGraph } = useContext(GraphContext);
  const { isFocusSpecifiedInURL, focusPath } = state;
  return (
    <div className="flex-grow flex flex-col m-2">
      {isFocusSpecifiedInURL ? <p>TODO</p> : <Entry content={state.getContentFromPath({})}></Entry>}
    </div>
  );
};
