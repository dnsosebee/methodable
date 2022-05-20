import React, { useContext } from "react";
import { pathEquals } from "../../lib/helpers";
import { IBlockContent } from "../../model/blockContent";
import { BLOCK_TYPES, IBlockType, OPTIONAL_BLOCK_TYPES } from "../../model/blockType";
import { fullBlockFromLocatedBlockId } from "../../model/fullBlock";
import { Action, IState, Path } from "../../model/state";
import { Context } from "../ContextWrapper";
import { BlockHandle, IBlockHandleProps } from "./BlockHandle";
import { BlockText, IBlockTextProps } from "./BlockText";
import { ContainerLine, IContainerLineProps } from "./ContainerLine";
import { RunButton } from "./RunButton";
import { ITypeSelectProps, TypeSelect } from "./TypeSelect";

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
          const parentContent = state.getContentFromPath(state.activeParentPath, true);
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
    contentId: props.content.id,
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
      props.path.length == 0 ? OPTIONAL_BLOCK_TYPES.UNDEFINED : props.parentBlockType.name,
    orderNum: props.orderNum,
    rootContentId: state.rootContentId,
    pathRelativeToRoot: [...state.rootRelativePath, ...props.path],
  };

  const blockContainerLineProps: IContainerLineProps = {
    parentBlockType: props.parentBlockType.name,
  };

  const shouldRenderRunButton = props.content.blockType.name !== BLOCK_TYPES.REFERENCE;
  const shallowSelectedClasses = props.isShallowSelected
    ? "shadow-[inset_0px_0px_5px_5px_rgba(0,0,0,0.1)]"
    : "";

  return (
    <div className={shallowSelectedClasses}>
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
