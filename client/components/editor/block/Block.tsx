import React, { useEffect } from "react";
import { pathEquals } from "../../../lib/helpers";
import { IBlockContent } from "../../../model/graph/blockContent";
import { fullBlockFromLocatedBlockId } from "../../../model/graph/fullBlock";
import { Path } from "../../../model/graph/graph";
import { createVerb, IVerb, VERB } from "../../../model/verbs/verb";
import { useGraph } from "../../GraphProvider";
import { useView } from "../../ViewProvider";
import { isChildBetweenSelection } from "../Editor";
import { useEditor } from "../EditorProvider";
import { BlockHandle, IBlockHandleProps } from "./BlockHandle";
import { BlockText, IBlockTextProps } from "./BlockText";
import { CollapseToggle, ICollapseToggleProps } from "./CollapseToggle";
import { ContainerLine, IContainerLineProps } from "./ContainerLine";
import { IRefCountProps, RefCount } from "./RefCount";
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
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Block = (props: IBlockProps) => {
  if (!props.content) {
    return null;
  }
  const { graphState } = useGraph();
  const { viewState } = useView();
  const { editorState } = useEditor();
  const childFullBlocks = props.content.childLocatedBlocks.map((childBlockId) => {
    return fullBlockFromLocatedBlockId(graphState, childBlockId);
  });
  const [collapsedChildren, setCollapsedChildren] = React.useState(
    childFullBlocks.map(
      (block) =>
        block.blockContent.childLocatedBlocks.size > 0 &&
        (block.blockContent.locatedBlocks.size > 1 || props.content.verb.name === VERB.CHOOSE)
    )
  );

  const getChildBlocks = () => {
    let numWorkspaceBlocks = 0;
    return childFullBlocks.map((childFullBlock, childIndex) => {
      const { blockContent: childBlockContent, locatedBlock: childLocatedBlock } = childFullBlock;
      if (childBlockContent.verb.isWorkspace()) {
        numWorkspaceBlocks++;
      }
      const childPath = props.path.push(childLocatedBlock.id);
      const childBlockProps: IBlockProps = {
        path: childPath,
        isGlobalSelectionActive: props.isGlobalSelectionActive,
        content: childBlockContent,
        parentVerb: props.content.verb,
        orderIndex: childIndex - numWorkspaceBlocks,
        ...getSelectednessInfo(childPath),
        collapsed: collapsedChildren.get(childIndex),
        setCollapsed: (collapsed: boolean) => {
          setCollapsedChildren((collapsedChildren) => {
            return collapsedChildren.set(childIndex, collapsed);
          });
        },
      };
      return <Block key={`block: ${childLocatedBlock.id}`} {...childBlockProps} />;
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
    if (editorState.isSelectionActive) {
      // we know something is selected, nothing more
      if (editorState.activeParentPath.size < path.size) {
        // we know the selection is higher than this block, nothing more
        const parentPathLength = editorState.activeParentPath.size;
        if (pathEquals(editorState.activeParentPath, path.slice(0, parentPathLength))) {
          // we know the selection is on children of this block's parent, nothing more
          const childLocatedBlockId = path.get(parentPathLength);
          try {
            if (isChildBetweenSelection(graphState, editorState, childLocatedBlockId)) {
              // we know this block or its parent is selected, nothing more (sufficient for deep selection)
              if (editorState.isSelectionByText) {
                isDeepSelected = true;
              } else if (parentPathLength + 1 === path.size) {
                isShallowSelected = true;
              }
            }
          } catch (e) {
            return { isShallowSelected, isDeepSelected };
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

  const refCountProps: IRefCountProps = {
    content: props.content,
  };

  const blockHandleProps: IBlockHandleProps = {
    parentVerb: props.path.size == 0 ? createVerb(VERB.UNDEFINED) : props.parentVerb,
    verb: props.content.verb,
    orderIndex: props.orderIndex,
    rootContentId: viewState.rootContentId,
    pathRelativeToRoot: viewState.rootRelativePath.concat(props.path),
  };

  const collapseToggleProps: ICollapseToggleProps = {
    collapsed: props.collapsed,
    visible: props.content.childLocatedBlocks.size > 0,
    onToggle: () => props.setCollapsed(!props.collapsed),
  };

  const containerLineProps: IContainerLineProps = {
    onClick: () => {
      if (collapsedChildren.reduce((acc, cur) => acc && cur, true)) {
        setCollapsedChildren(collapsedChildren.map((_) => false));
      } else {
        setCollapsedChildren(collapsedChildren.map((_) => true));
      }
    },
  };

  const shouldRenderRunButton =
    props.content.verb.isWorkspace() === false && props.content.verb.name !== VERB.ANSWER;
  const shallowSelectedClasses = props.isShallowSelected
    ? "shadow-[inset_0px_0px_5px_7px_rgba(0,100,256,0.15)]"
    : "";

  const isRoot = props.path.size === 0;
  const rootRowClasses = isRoot ? "border-b pb-0.5 mb-0.5 border-gray-200 " : "";

  useEffect((): void => {
    if (
      viewState.focusPath &&
      viewState.focusPath.size > props.path.size &&
      pathEquals(viewState.focusPath.slice(0, props.path.size), props.path)
    ) {
      props.setCollapsed(false);
    }
  }, [viewState.focusPath]);

  return (
    <div className="flex flex-grow">
      {!isRoot && (
        <>
          <CollapseToggle {...collapseToggleProps} />
          <div className="flex flex-col">
            <BlockHandle {...blockHandleProps} />
            <ContainerLine {...containerLineProps} />
          </div>
        </>
      )}
      <div className={`flex-col flex-grow ${shallowSelectedClasses}`}>
        <div className={`flex ${rootRowClasses}`}>
          <VerbSelect {...verbSelectProps}></VerbSelect>
          <RefCount {...refCountProps} />
          <BlockText {...blockTextProps} />
          {shouldRenderRunButton && <RunButton {...{ contentId: props.content.id, isRoot }} />}
        </div>
        {childBlocks.size > 0 && !props.collapsed && (
          <div className={isRoot ? "overflow-y-auto max-h-[calc(100%_-_35px)]" : ""}>
            {isRoot ? (
              <div className="flex">
                <div className="flex flex-col mt-1">
                  <ContainerLine {...containerLineProps} />
                </div>
                <div className="grow">{childBlocks}</div>
              </div>
            ) : (
              childBlocks
            )}
          </div>
        )}
      </div>
    </div>
  );
};
