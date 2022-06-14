import { Path } from "../../../model/graph/graph";
import { getLink } from "../../../model/view";
import { useView } from "../../ViewProvider";
import { GuideButton, IGuideButtonVisualProps } from "./GuideButton";

export interface IContinueButtonProps extends IGuideButtonVisualProps {
  continuationPath: Path;
}

export const ContinueButton = (props: IContinueButtonProps) => {
  const { viewState } = useView();
  return (
    <GuideButton
      {...{ ...props, href: getLink(viewState, { focusPath: props.continuationPath }) }}
    ></GuideButton>
  );
};
