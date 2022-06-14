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
    <>
      <button className={`text-left text-gray-300 hover:bg-gray-100`} onClick={toggleContext}>
        {guideState.showContext
          ? "▼ back to focus mode"
          : props.text
          ? props.text
          : "▶︎ show justification"}
      </button>
      <div className="ml-5">
        {showContext ? props.children : null}
        {showContext ? <ContextLine pre="Now.." text="" href="" /> : null}
      </div>
    </>
  );
};
