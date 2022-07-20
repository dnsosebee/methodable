import { IView } from "../../../model/view";
import { useView } from "../../ViewProvider";
import { RichifiedText } from "../RichifiedText";

export interface IGuideButtonVisualProps {
  text: string;
  center?: boolean;
  highlight?: boolean;
}

export interface IGuideButtonProps extends IGuideButtonVisualProps {
  partialView: Partial<IView>;
}

export const GuideButton = (props: IGuideButtonProps) => {
  const { RedirectView } = useView();
  return (
    <RedirectView
      partialView={props.partialView}
      className={`p-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded mt-2 shadow ${
        props.center ? "text-center" : ""
      } ${props.highlight ? " bg-blue-100 hover:bg-blue-200" : ""}`}
    >
      <RichifiedText text={props.text} />
    </RedirectView>
  );
};
