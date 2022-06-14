import { List } from "immutable";
import { useRouter } from "next/router";
import { PATH_DELIMITER, PATH_SEPARATOR } from ".";
import { GraphProvider } from "../../../client/components/GraphProvider";
import { View } from "../../../client/components/View";
import { Path } from "../../../client/model/graph/graph";
import { strToMode } from "../../../client/model/view";

export const getURLPaths = (paths: string): { rootRelativePath: Path; focusPath: Path } => {
  let rootRelativePath: Path;
  let focusPath: Path;
  if (!paths) {
    paths = "";
  }
  if (paths.includes(PATH_SEPARATOR)) {
    const [rootRelativePathString, focusPathString] = paths.split(PATH_SEPARATOR);
    rootRelativePath =
      rootRelativePathString === "" ? List() : List(rootRelativePathString.split(PATH_DELIMITER));
    focusPath = focusPathString === "" ? List() : List(focusPathString.split(PATH_DELIMITER));
  } else {
    rootRelativePath = paths === "" ? List() : List(paths.split(PATH_DELIMITER));
  }
  return {
    rootRelativePath,
    focusPath,
  };
};

const Container = () => {
  const router = useRouter();
  let { mode, rootContentId, paths } = router.query;
  // TODO this is a hack, I might need to use getInitialProps, or something
  if (!mode) {
    return null;
  }
  if (!rootContentId) {
    return null;
  }
  if (!paths) {
    return null;
  }
  if (mode instanceof Array) {
    mode = mode[0];
  }
  if (rootContentId instanceof Array) {
    rootContentId = rootContentId[0];
  }
  if (paths instanceof Array) {
    paths = paths[0];
  }

  const { rootRelativePath, focusPath } = getURLPaths(paths);

  const viewProps = {
    mode: strToMode(mode),
    rootContentId,
    rootRelativePath: rootRelativePath,
    focusPath: focusPath,
    focusPosition: null,
  };
  return (
    <GraphProvider>
      <View {...viewProps} />
    </GraphProvider>
  );
};

export default Container;
