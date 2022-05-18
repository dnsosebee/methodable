import { useContext } from "react";
import { IState, Path } from "../../model/state";
import { blockType, OPTIONAL_BLOCK_TYPES } from "../../model/blockType";
import { Context } from "../ContextWrapper";
import { Block, IBlockProps } from "./Block";
import { Breadcrumbs, IBreadcrumbsProps } from "./Breadcrumbs";
import { BlockContentId } from "../../model/blockContent";

export const EditorContainer = () => {
  const { state }: { state: IState } = useContext(Context);
  const rootContent = state.getContentFromPath();

  const rootBlockProps: IBlockProps = {
    path: [],
    content: rootContent,
    isShallowSelected: false,
    isDeepSelected: false,
    isGlobalSelectionActive: state.isSelectionActive,
    parentBlockType: blockType(OPTIONAL_BLOCK_TYPES.UNDEFINED),
    orderNum: 0,
  };

  const breadcrumbProps: IBreadcrumbsProps = {
    rootContentId: state.rootContentId,
    rootRelativePath: state.rootRelativePath,
  };

  return (
    <>
      {state.rootRelativePath.length > 0 ? <Breadcrumbs {...breadcrumbProps} /> : null}
      <Block {...rootBlockProps} />
    </>
  );
};
