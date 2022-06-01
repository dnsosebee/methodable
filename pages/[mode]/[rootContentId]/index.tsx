import { useRouter } from "next/router";
import { GraphProvider } from "../../../client/components/GraphProvider";
import { EditorContainer } from "../../../client/components/editor/EditorContainer";
import { GuideContainer } from "../../../client/components/guide/GuideContainer";
import { Path } from "../../../client/model/graph";
import FourOhFour from "../../404";
import { FullPathProvider } from "../../../client/components/FullPathProvider";
import { LocatedBlockId } from "../../../client/model/locatedBlock";
import { List } from "immutable";

const MODES = {
  EDIT: "edit",
  GUIDE: "guide",
};

export const BASE_URL = "https://localhost:3000/";
export const SELECTION_RELATIVE_URL = "select/";
export const SELECTION_BASE_URL = BASE_URL + SELECTION_RELATIVE_URL;
export const PATH_DELIMITER = ",";
export const PATH_SEPARATOR = ";";

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
    rootRelativePath: List<LocatedBlockId>() as Path,
    focusPath: List<LocatedBlockId>() as Path,
    isFocusSpecifiedInURL: false,
  };
  return (
    <GraphProvider {...contextWrapperProps}>
      <FullPathProvider {...contextWrapperProps}>{getChildComponent(mode)}</FullPathProvider>
    </GraphProvider>
  );
};

export default Container;
