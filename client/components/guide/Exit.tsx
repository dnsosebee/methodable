import { List } from "immutable";
import { getContentFromPath } from "../../model/graphWithView";
import { getLink, MODE } from "../../model/view";
import { useGraph } from "../GraphProvider";
import { useView } from "../ViewProvider";
import { Wrapper } from "../Wrapper";
import { GuideButton } from "./buttons/GuideButton";
import { RichifiedText } from "./RichifiedText";

// Deprecated - ish
export const Exit = () => {
  const { graphState } = useGraph();
  const { viewState } = useView();
  const content = getContentFromPath(graphState, viewState, {});

  return (
    <Wrapper {...{ shouldGrow: true }}>
      <h1 className="text-xl">
        <span className="text-gray-400">You have completed</span>{" "}
        <RichifiedText text={content.humanText} />
      </h1>
      <p className={"italic text-sm"}>A Human Program</p>
      <div className={"flex-grow"}></div>
      <GuideButton
        {...{
          text: "Start Over",
          href: getLink(viewState, { mode: MODE.GUIDE, focusPath: List() }),
        }}
      ></GuideButton>
    </Wrapper>
  );
};
