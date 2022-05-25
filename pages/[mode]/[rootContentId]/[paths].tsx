import { useRouter } from "next/router";
import { getChildComponent, PATH_DELIMITER, PATH_SEPARATOR } from ".";
import { GraphContextWrapper } from "../../../client/components/GraphContextWrapper";
import { Path } from "../../../client/model/graph";

export const getURLPaths = (
  paths: string
): { rootRelativePath: Path; focusPath: Path; isFocusSpecifiedInURL: boolean } => {
  let rootRelativePath: string;
  let focusPath: string = "";
  let isFocusSpecifiedInURL = false;
  if (!paths) {
    paths = "";
  }
  if (paths.includes(PATH_SEPARATOR)) {
    [rootRelativePath, focusPath] = paths.split(PATH_SEPARATOR);
    isFocusSpecifiedInURL = true;
  } else {
    rootRelativePath = paths;
  }
  const rootRelativePathArray = rootRelativePath === "" ? [] : rootRelativePath.split(PATH_DELIMITER);
  const focusPathArray = focusPath === "" ? [] : focusPath.split(PATH_DELIMITER);
  return {
    rootRelativePath: rootRelativePathArray,
    focusPath: focusPathArray,
    isFocusSpecifiedInURL,
  };
};

const Container = () => {
  const router = useRouter();
  let { mode, rootContentId, paths } = router.query;

  if (mode instanceof Array) {
    mode = mode[0];
  }
  if (rootContentId instanceof Array) {
    rootContentId = rootContentId[0];
  }
  if (paths instanceof Array) {
    paths = paths[0];
  }

  const { rootRelativePath, focusPath, isFocusSpecifiedInURL } = getURLPaths(paths);

  // TODO this is a hack, I might need to use getInitialProps, or something
  if (!rootContentId) {
    return null;
  }
  if (!rootRelativePath) {
    return null;
  }
  if (!focusPath) {
    return null;
  }
  const contextWrapperProps = {
    rootContentId,
    rootRelativePath: rootRelativePath,
    focusPath: focusPath,
    isFocusSpecifiedInURL,
  };
  return <GraphContextWrapper {...contextWrapperProps}>{getChildComponent(mode)}</GraphContextWrapper>;
};

export default Container;
