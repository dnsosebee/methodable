import { IBlockContent } from "../../model/graph/blockContent";
import { fullBlockFromLocatedBlockId } from "../../model/graph/fullBlock";
import { getLink, IView } from "../../model/view";
import { useGraph } from "../GraphProvider";
import { useView } from "../ViewProvider";
import { GuideButton } from "./GuideButton";

export interface IEntryProps {
  content: IBlockContent;
  viewAfterCompletion: IView;
}

export const Entry = (props: IEntryProps) => {
  const { viewState } = useView();
  const { graphState } = useGraph();
  const children = props.content.childLocatedBlocks.map((childId) =>
    fullBlockFromLocatedBlockId(graphState, childId)
  );
  return (
    <>
      <h1 className="text-xl font-bold">{props.content.humanText}</h1>
      <p className={"italic text-sm"}>A Human Program</p>
      <div className={"flex-grow"}></div>
      <GuideButton
        {...{
          text: "Begin",
          href: getLink(
            viewState,
            props.content.verb.getNextView(
              graphState,
              children,
              null,
              null,
              props.viewAfterCompletion
            )
          ),
          highlight: true,
        }}
      ></GuideButton>
    </>
  );
};
