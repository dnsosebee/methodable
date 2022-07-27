import { IView } from "../../model/view";
import { useView } from "../ViewProvider";
import { RichifiedText } from "./RichifiedText";

export interface IContextLineProps {
  pre: string;
  text: string;
  partialView: Partial<IView>;
}

export const ContextLine = (props: IContextLineProps) => {
  const { pre, text, partialView } = props;
  const { RedirectView } = useView();
  return (
    <div className="flex mt-1">
      <p className="text-gray-400">•</p>
      <p className="ml-2 text-gray-400">
        <span>{pre}</span>

        <RedirectView partialView={partialView} className="bg-slate-200 hover:bg-slate-300">
          <RichifiedText text={text} />
        </RedirectView>
      </p>
    </div>
  );
};
