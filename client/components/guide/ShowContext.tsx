import { ContextLine } from "./ContextLine";
import { useGuide } from "./GuideProvider";

export interface IShowContextProps {
  children: React.ReactNode;
  text?: string;
}

export const ShowContext = (props: IShowContextProps) => {
  const { guideState, guideDispatch } = useGuide();
  const { showContext } = guideState;
  const toggleContext = () => {
    guideDispatch((state) => {
      return state.toggleContext();
    });
  };
  return (
    <div className="border-b pb-2">
      <button
        className={`text-left text-gray-400 hover:bg-slate-200 rounded-lg py-1 px-2`}
        onClick={toggleContext}
      >
        {guideState.showContext
          ? "▼ return to focus mode"
          : props.text
          ? props.text
          : "▶︎ show context"}
      </button>
      <div className="ml-5">
        {showContext ? props.children : null}
        {showContext ? <ContextLine pre="Now..." text="" partialView={{}} /> : null}
      </div>
    </div>
  );
};
