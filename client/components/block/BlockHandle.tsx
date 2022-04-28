import { useContext } from "react";
import { getBlockIdByHIndex } from "../../model/state/actionHelpers";
import { IAction } from "../../model/state/actionTypes";
import { BLOCK_TYPES } from "../../model/state/blockType";
import { BlockId, HierarchyIndex, IState } from "../../model/state/stateTypes";
import { Context } from "./ContextBlock";

export const UNORDERED = "•";
export interface IBlockHandleProps {
  id: BlockId;
  hIndex: HierarchyIndex;
}

export const BlockHandle = (props: IBlockHandleProps) => {
  const { state, dispatch }: { state: IState; dispatch: (action: IAction) => {} } =
    useContext(Context);

  let lineNumber = UNORDERED;
  if (props.hIndex.length > 0) {
    const parentHindex = props.hIndex.slice(0, props.hIndex.length - 1);
    const parentBlock = getBlockIdByHIndex(state.blocksMap, state.rootBlockId, parentHindex);
    const parentBlockType = state.blocksMap.get(parentBlock).blockType;
    if (parentBlockType.name !== BLOCK_TYPES.READING) {
      lineNumber = String(props.hIndex[props.hIndex.length - 1] + 1) + ".";
    }
  }

  return <p className={"text-gray-300"}>{lineNumber}&nbsp;</p>;
};
