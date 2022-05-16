import React, { useContext } from "react";
import { Context } from "../ContextWrapper";
import { BlockText, IBlockTextProps } from "./BlockText";
import { ITypeSelectProps, TypeSelect } from "./TypeSelect";
import { BlockHandle, IBlockHandleProps } from "./BlockHandle";
import { pathEquals } from "../../lib/helpers";
import { ContainerLine, IContainerLineProps } from "./ContainerLine";
import { BLOCK_TYPES, IBlockType, OPTIONAL_BLOCK_TYPES } from "../../model/blockType";
import { RunButton } from "./RunButton";
import { Action, IState, Path } from "../../model/state";
import { fullBlockFromLocatedBlockId } from "../../model/fullBlock";
import { IBlockContent } from "../../model/blockContent";

export interface IBlockProps {
  path: Path;
  content: IBlockContent;
  isShallowSelected: boolean;
  isDeepSelected: boolean;
  isGlobalSelectionActive: boolean;
  parentBlockType: IBlockType;
  orderNum: number;
}

export const Block = (props: IBlockProps) => {
  const { state, dispatch }: { state: IState; dispatch: (action: Action) => {} } =
    useContext(Context);

  const getChildBlocks = () => {
    return props.content.childLocatedBlocks.map((childId, childIndex) => {
      const { blockContent: childBlockContent } = fullBlockFromLocatedBlockId(state, childId);
      const childPath = [...props.path, childId];
      const childBlockProps: IBlockProps = {
        path: childPath,
        isGlobalSelectionActive: props.isGlobalSelectionActive,
        content: childBlockContent,
        parentBlockType: props.content.blockType,
        orderNum: childIndex + 1,
        ...getSelectednessInfo(childPath),
      };
      return (
        <>
          <Block key={childIndex} {...childBlockProps} />
        </>
      );
    });
  };

  const getSelectednessInfo = (
    path: Path
  ): {
    isShallowSelected: boolean;
    isDeepSelected: boolean;
  } => {
    let isShallowSelected = false;
    let isDeepSelected = false;
    if (state.isSelectionActive) {
      // we know something is selected, nothing more
      if (state.activeParentPath.length < path.length) {
        // we know the selection is higher than this block, nothing more
        const parentPathLength = state.activeParentPath.length;
        if (pathEquals(state.activeParentPath, path.slice(0, parentPathLength))) {
          // we know the selection is on children of this block's parent, nothing more
          const childLocatedBlockId = path[parentPathLength];
          const bound1 = state.selectionRange.start[parentPathLength];
          const bound2 = state.selectionRange.end[parentPathLength];
          const parentContent = fullBlockFromLocatedBlockId(
            state,
            state.activeParentPath[parentPathLength - 1]
          ).blockContent;
          if (parentContent.isChildBetween(childLocatedBlockId, bound1, bound2)) {
            // we know this block or its parent is selected, nothing more (sufficient for deep selection)
            if (state.isSelectionDeep) {
              isDeepSelected = true;
            } else if (parentPathLength + 1 === path.length) {
              isShallowSelected = true;
            }
          }
        }
      }
    }
    return { isShallowSelected, isDeepSelected };
  };

  const childBlocks = getChildBlocks();

  const blockTextProps: IBlockTextProps = {
    humanText: props.content.humanText,
    path: props.path,
    isGlobalSelectionActive: props.isGlobalSelectionActive,
    isDeepSelected: props.isDeepSelected,
  };

  const typeSelectProps: ITypeSelectProps = {
    content: props.content,
  };

  const blockHandleProps: IBlockHandleProps = {
    parentBlockType:
      props.path.length <= 1 ? OPTIONAL_BLOCK_TYPES.UNDEFINED : props.parentBlockType.name,
    orderNum: props.orderNum,
  };

  const blockContainerLineProps: IContainerLineProps = {
    parentBlockType: props.parentBlockType.name,
  };

  const shouldRenderRunButton = props.content.blockType.name !== BLOCK_TYPES.REFERENCE;

  return (
    <div>
      <div className="flex">
        <BlockHandle {...blockHandleProps} />
        <TypeSelect {...typeSelectProps}></TypeSelect>
        <BlockText {...blockTextProps} />
        {shouldRenderRunButton && <RunButton {...{ contentId: props.content.id }} />}
      </div>
      {childBlocks.length > 0 && (
        <div className="flex">
          <ContainerLine {...blockContainerLineProps} />
          <div className="flex-grow">{childBlocks}</div>
        </div>
      )}
    </div>
  );
};
