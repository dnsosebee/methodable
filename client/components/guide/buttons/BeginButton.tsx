import { IBlockContent } from "../../../model/graph/blockContent";
import { Path } from "../../../model/graph/graph";
import { getLink } from "../../../model/view";
import { useGraph } from "../../GraphProvider";
import { useView } from "../../ViewProvider";
import { GuideButton, IGuideButtonVisualProps } from "./GuideButton";

export interface IBeginButtonProps extends IGuideButtonVisualProps {
  content: IBlockContent;
  path: Path;
}

export const BeginButton = (props: IBeginButtonProps) => {
  const { graphState } = useGraph();
  const { viewState } = useView();
  const newPath = props.path.concat(props.content.verb.getBeginPath(graphState, props.content));
  return (
    <GuideButton {...{ ...props, href: getLink(viewState, { focusPath: newPath }) }}></GuideButton>
  );
};
