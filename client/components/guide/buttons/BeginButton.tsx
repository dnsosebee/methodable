import { IBlockContent } from "../../../model/graph/blockContent";
import { Path } from "../../../model/graph/graph";
import { useGraph } from "../../GraphProvider";
import { GuideButton, IGuideButtonVisualProps } from "./GuideButton";

export interface IBeginButtonProps extends IGuideButtonVisualProps {
  content: IBlockContent;
  path: Path;
}

export const BeginButton = (props: IBeginButtonProps) => {
  const { graphState } = useGraph();
  const newPath = props.path.concat(props.content.verb.getBeginPath(graphState, props.content));
  return <GuideButton {...{ ...props, partialView: { focusPath: newPath } }}></GuideButton>;
};
