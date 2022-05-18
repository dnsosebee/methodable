import { useRouter } from "next/router";
import path from "path";
import { getChildComponent } from ".";
import { ContextWrapper } from "../../../client/components/ContextWrapper";
import { Path } from "../../../client/model/state";

const Container = () => {
  const router = useRouter();
  let { mode, rootContentId, paths } = router.query;
  let isFocusSpecifiedInPaths = false;
  let rootRelativePath: string;
  let focusPath: string = "";
  
  if (mode instanceof Array) {
    mode = mode[0];
  }
  if (rootContentId instanceof Array) {
    rootContentId = rootContentId[0];
  }
  if (paths instanceof Array) {
    paths = paths[0];
  }
  if (!paths) {
    paths = ".";
  }
  if (paths.includes('.')) {
    const [rootRelativePath, focusPath] = paths.split('.');
    isFocusSpecifiedInPaths = true;
  } else {
    rootRelativePath = paths;
  }
  const rootRelativePathArray = rootRelativePath === "" ? [] : rootRelativePath.split(",");
  const focusPathArray = focusPath === "" ? [] : focusPath.split(",");
  // TODO this is a hack, I might need to use getInitialProps, or something
  if (!rootContentId) {
    return null;
  }
  const contextWrapperProps = {
    rootContentId,
    rootRelativePath: rootRelativePathArray,
    focusPath: focusPathArray,
    isFocusSpecifiedInPaths,
  };
  console.log(contextWrapperProps);
  return <ContextWrapper {...contextWrapperProps}>{getChildComponent(mode)}</ContextWrapper>;
};

export default Container;
