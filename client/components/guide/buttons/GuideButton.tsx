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
      className={`p-2  rounded-xl mb-4 shadow-lg ${props.center ? "text-center" : ""} ${
        props.highlight
          ? " text-gray-700 bg-blue-200 hover:bg-blue-300"
          : "text-gray-700 bg-slate-200 hover:bg-slate-300"
      }`}
    >
      <RichifiedText text={props.text} />
    </RedirectView>
  );
};
