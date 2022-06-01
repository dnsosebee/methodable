import React from "react";
import { pathEquals } from "../../lib/helpers";
import { IBlockContent } from "../../model/blockContent";
import { fullBlockFromLocatedBlockId } from "../../model/fullBlock";
import { Path } from "../../model/graph";
import { useGraphWithPaths } from "../../model/graphWithPaths";
import { IVerb, verb, VERB } from "../../model/verbs/verb";
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
  const { graphState, fullPathState, getContentFromPath } = useGraphWithPaths();

  const getChildBlocks = () => {
    let numAdditiveBlocks = 0;
    return props.content.childLocatedBlocks.map((childId, childIndex) => {
      const { blockContent: childBlockContent } = fullBlockFromLocatedBlockId(graphState, childId);
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
    if (graphState.isSelectionActive) {
      // we know something is selected, nothing more
      if (graphState.activeParentPath.length < path.length) {
        // we know the selection is higher than this block, nothing more
        const parentPathLength = graphState.activeParentPath.length;
        if (pathEquals(graphState.activeParentPath, path.slice(0, parentPathLength))) {
          // we know the selection is on children of this block's parent, nothing more
          const childLocatedBlockId = path[parentPathLength];
          const bound1 = graphState.selectionRange.start[parentPathLength];
          const bound2 = graphState.selectionRange.end[parentPathLength];
          const parentContent = getContentFromPath({
            focusPath: graphState.activeParentPath,
          });
          if (parentContent.isChildBetween(childLocatedBlockId, bound1, bound2)) {
            // we know this block or its parent is selected, nothing more (sufficient for deep selection)
            if (graphState.isSelectionDeep) {
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
    rootContentId: fullPathState.rootContentId,
    pathRelativeToRoot: [...fullPathState.rootRelativePath, ...props.path],
  };

  const shouldRenderRunButton = props.content.verb.isAdditive() === false;
  const shallowSelectedClasses = props.isShallowSelected
    ? "shadow-[inset_0px_0px_5px_7px_rgba(0,100,256,0.15)]"
    : "";

  const isRoot = props.path.length === 0;
  const rootRowClasses = isRoot ? "border-b mb-0.5 border-gray-200 " : "";
  return (
    <>
      <div className="flex">
        {!isRoot && (
          <div className="flex flex-col">
            <BlockHandle {...blockHandleProps} />
            <ContainerLine />
          </div>
        )}
        <div className={`flex-col flex-grow ${shallowSelectedClasses}`}>
          <div className={`flex ${rootRowClasses}`}>
            <VerbSelect {...verbSelectProps}></VerbSelect>
            <BlockText {...blockTextProps} />
            {shouldRenderRunButton && <RunButton {...{ contentId: props.content.id }} />}
          </div>
          {childBlocks.length > 0 && childBlocks}
        </div>
      </div>
    </>
  );
};
