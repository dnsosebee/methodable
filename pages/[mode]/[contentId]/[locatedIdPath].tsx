import { useRouter } from "next/router";
import { ContextWrapper } from "../../../client/components/ContextWrapper";
import {
  EditorContainer,
  IEditorContainerProps,
} from "../../../client/components/editor/EditorContainer";
import { GuideContainer } from "../../../client/components/guide/GuideContainer";
import { BlockContentId } from "../../../client/model/blockContent";
import { Path } from "../../../client/model/state";
import FourOhFour from "../../404";

const MODES = {
  EDIT: "edit",
  GUIDE: "guide",
};

// TODO - fill in routes for ""
export const getChildComponent = (mode: string, rootContentId: BlockContentId, rootRelativePath: Path) => {
  const editorProps: IEditorContainerProps = {
    rootContentId,
    rootRelativePath,
  };

  switch (mode) {
    case MODES.EDIT:
      return <EditorContainer {...editorProps}/>;
    case MODES.GUIDE:
      return <GuideContainer />;
    default:
      return <FourOhFour />;
  }
};

const Container = () => {
  const router = useRouter();
  let { mode, contentId, locatedIdPath } = router.query;
  if (mode instanceof Array) {
    mode = mode[0];
  }
  if (contentId instanceof Array) {
    contentId = contentId[0];
  }
  if (locatedIdPath instanceof Array) {
    locatedIdPath = locatedIdPath[0];
  }
  locatedIdPath = locatedIdPath ? locatedIdPath : "";
  const locatedIdPathArray = locatedIdPath.split(",");
  // TODO this is a hack, I might need to use getInitialProps, or something
  if (!contentId) {
    return null;
  }
  console.log(`locatedIdPathArray: ${locatedIdPathArray}`);
  return (
    <ContextWrapper contentId={contentId} idPath={locatedIdPathArray}>
      {getChildComponent(mode, contentId, locatedIdPathArray)}
    </ContextWrapper>
  );
};

export default Container;
