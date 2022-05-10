import { useContext, useState } from "react";
import { BLOCK_TYPES } from "../../model/state/blockType";
import { IBlock, IState } from "../../model/state/stateTypes";
import { Context } from "../ContextWrapper";
import { DoPage, IDoPageProps } from "./DoPage";
import { Entry, IEntryProps } from "./Entry";

const getPathToNext = (state: IState): string => {
  const ancestors = state.idPath.slice(0, state.idPath.length - 2);
  return "";
};

export const GuideContainer = () => {
  const { state }: { state: IState } = useContext(Context);
  const [showEntry, setShowEntry] = useState(state.idPath.length === 1);
  const showEntryCallback = () => {
    setShowEntry(false);
  };

  const activeBlock: IBlock = state.blocksMap.get(state.rootBlockId);
  const entryProps: IEntryProps = {
    humanText: activeBlock.humanText,
    showEntryCallback,
  };

  let guidePageComponent: JSX.Element;
  switch (activeBlock.blockType.name) {
    case BLOCK_TYPES.DO:
      const doPageProps: IDoPageProps = {
        humanText: activeBlock.humanText,
        pathToNext: getPathToNext(state),
      };
      guidePageComponent = <DoPage {...doPageProps} />;
      break;
    default:
      guidePageComponent = <p>default</p>;
  }

  return (
    <>
      {showEntry && <Entry {...entryProps} />}
      {!showEntry && guidePageComponent}
    </>
  );
};