import { useRouter } from "next/router";
import { ContextWrapper } from "../../../client/components/ContextWrapper";
import { EditorContainer } from "../../../client/components/editor/EditorContainer";
import { GuideContainer } from "../../../client/components/guide/GuideContainer";
import { Path } from "../../../client/model/state";
import FourOhFour from "../../404";

const MODES = {
  EDIT: "edit",
  GUIDE: "guide",
};

// TODO - fill in routes for ""
export const getChildComponent = (mode: string) => {
  switch (mode) {
    case MODES.EDIT:
      return <EditorContainer />;
    case MODES.GUIDE:
      return <GuideContainer />;
    default:
      return <FourOhFour />;
  }
};

const Container = () => {
  const router = useRouter();
  let { mode, rootContentId } = router.query;
  if (mode instanceof Array) {
    mode = mode[0];
  }
  if (rootContentId instanceof Array) {
    rootContentId = rootContentId[0];
  }
  // TODO this is a hack, I might need to use getInitialProps, or something
  if (!rootContentId) {
    return null;
  }
  const contextWrapperProps = {
    rootContentId,
    rootRelativePath: [] as Path,
    focusPath: [] as Path,
    isFocusSpecifiedInPaths: false,
  };
  return <ContextWrapper {...contextWrapperProps}>{getChildComponent(mode)}</ContextWrapper>;
};

export default Container;
