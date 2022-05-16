import { useContext } from "react";
import { fullBlockFromLocatedBlockId, IState } from "../../model/state";
import { blockType, OPTIONAL_BLOCK_TYPES } from "../../model/blockType";
import { Context } from "../ContextWrapper";
import { Block, IBlockProps } from "./Block";

export const EditorContainer = () => {
  const { state }: { state: IState } = useContext(Context);
  const rootLocatedBlockId = state.locatedIdPath[state.locatedIdPath.length - 1];
  const rootBlock = fullBlockFromLocatedBlockId(state, rootLocatedBlockId);

  const rootBlockProps: IBlockProps = {
    path: [rootLocatedBlockId],
    content: rootBlock.blockContent,
    isShallowSelected: false,
    isDeepSelected: false,
    isGlobalSelectionActive: state.isSelectionActive,
    parentBlockType: blockType(OPTIONAL_BLOCK_TYPES.UNDEFINED),
    orderNum: 0,
  };

  return <Block {...rootBlockProps} />;
};
