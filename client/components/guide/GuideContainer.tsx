import { getContentFromPath } from "../../model/graphWithPaths";
import { useFullPath } from "../FullPathProvider";
import { useGraph } from "../GraphProvider";
import { Entry } from "./Entry";

export const GuideContainer = () => {
  const { graphState } = useGraph();
  const { fullPathState } = useFullPath();
  const { isFocusSpecifiedInURL, focusPath } = fullPathState;
  return (
    <div className="flex-grow flex flex-col m-2">
      {isFocusSpecifiedInURL ? (
        <p>TODO</p>
      ) : (
        <Entry content={getContentFromPath(graphState, fullPathState, {})}></Entry>
      )}
    </div>
  );
};
