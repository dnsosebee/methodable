import { Path } from "../../../model/graph/graph";
import { GuideButton, IGuideButtonVisualProps } from "./GuideButton";

export interface IContinueButtonProps extends IGuideButtonVisualProps {
  continuationPath: Path;
}

export const ContinueButton = (props: IContinueButtonProps) => {
  return (
    <GuideButton
      {...{ ...props, partialView: { focusPath: props.continuationPath } }}
    ></GuideButton>
  );
};
