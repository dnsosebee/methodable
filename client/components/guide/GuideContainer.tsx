import { useGraphWithPaths } from "../../model/graphWithPaths";
import { Entry } from "./Entry";

export const GuideContainer = () => {
  const { graphState, fullPathState, getContentFromPath } = useGraphWithPaths();
  const { isFocusSpecifiedInURL, focusPath } = fullPathState;
  return (
    <div className="flex-grow flex flex-col m-2">
      {isFocusSpecifiedInURL ? <p>TODO</p> : <Entry content={getContentFromPath({})}></Entry>}
    </div>
  );
};
