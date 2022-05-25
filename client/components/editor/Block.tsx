import React, { useContext } from "react";
import { pathEquals } from "../../lib/helpers";
import { IBlockContent } from "../../model/blockContent";
import { fullBlockFromLocatedBlockId } from "../../model/fullBlock";
import { GraphAction, IGraph, Path } from "../../model/graph";
import { IVerb, verb, VERB } from "../../model/verbs/verb";
import { GraphContext } from "../GraphContextWrapper";
import { BlockHandle, IBlockHandleProps } from "./BlockHandle";
import { BlockText, IBlockTextProps } from "./BlockText";
import { ContainerLine } from "./ContainerLine";
import { RunButton } from "./RunButton";
import { IVerbSelectProps, VerbSelect } from "./VerbSelect";

export interface IBlockProps {
  path: Path;
  content: IBlockContent;
  isShallowSelected: boolean;
  isDeepSelected: boolean;
  isGlobalSelectionActive: boolean;
  parentVerb?: IVerb;
  orderIndex: number;
}

export const Block = (props: IBlockProps) => {
  const { state, dispatch }: { state: IGraph; dispatch: (action: GraphAction) => {} } =
    useContext(GraphContext);

  const getChildBlocks = () => {
    let numAdditiveBlocks = 0;
    return props.content.childLocatedBlocks.map((childId, childIndex) => {
      const { blockContent: childBlockContent } = fullBlockFromLocatedBlockId(state, childId);
      const childPath = [...props.path, childId];
      const childBlockProps: IBlockProps = {
        path: childPath,
        isGlobalSelectionActive: props.isGlobalSelectionActive,
        content: childBlockContent,
        parentVerb: props.content.verb,
        orderIndex: childIndex - numAdditiveBlocks,
        ...getSelectednessInfo(childPath),
      };
      return (
        <>
          <Block key={childId} {...childBlockProps} />
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
          const parentContent = state.getContentFromPath({ focusPath: state.activeParentPath });
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

  const verbSelectProps: IVerbSelectProps = {
    content: props.content,
  };

  const blockHandleProps: IBlockHandleProps = {
    parentVerb: props.path.length == 0 ? verb(VERB.UNDEFINED) : props.parentVerb,
    verb: props.content.verb,
    orderIndex: props.orderIndex,
    rootContentId: state.rootContentId,
    pathRelativeToRoot: [...state.rootRelativePath, ...props.path],
  };

  const shouldRenderRunButton = props.content.verb.isAdditive() === false;
  const shallowSelectedClasses = props.isShallowSelected
    ? "shadow-[inset_0px_0px_5px_5px_rgba(0,0,0,0.1)]"
    : "";

  return (
    <div className={shallowSelectedClasses}>
      <div className="flex">
        { props.parentVerb.name !== VERB.UNDEFINED && <BlockHandle {...blockHandleProps} /> }
        <VerbSelect {...verbSelectProps}></VerbSelect>
        <BlockText {...blockTextProps} />
        {shouldRenderRunButton && <RunButton {...{ contentId: props.content.id }} />}
      </div>
      {childBlocks.length > 0 && (
        <div className="flex">
          { props.parentVerb.name !== VERB.UNDEFINED && <ContainerLine /> }
          <div className="flex-grow">{childBlocks}</div>
        </div>
      )}
    </div>
  );
};
