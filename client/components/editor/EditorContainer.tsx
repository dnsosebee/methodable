import { useContext } from "react";
import { IBlock, IState } from "../../model/state/stateTypes";
import { Context } from "../ContextWrapper";
import { Block, IBlockProps } from "./Block";

export const EditorContainer = () => {
  const { state }: { state: IState } = useContext(Context);

  const rootBlock: IBlock = state.blocksMap.get(state.rootBlockId);
  const rootBlockProps: IBlockProps = {
    id: state.rootBlockId,
    humanText: rootBlock.humanText,
    isShallowSelected: false,
    isDeepSelected: false,
    children: rootBlock.children,
    isGlobalSelectionActive: state.isSelectionActive,
    hIndex: [],
  };

  return <Block {...rootBlockProps} />;
};
