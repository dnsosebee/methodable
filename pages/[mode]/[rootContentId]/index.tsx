import { List } from "immutable";
import { useRouter } from "next/router";
import { GraphProvider } from "../../../client/components/GraphProvider";
import { Tool } from "../../../client/components/Tool";
import { ViewProvider } from "../../../client/components/ViewProvider";
import { Path } from "../../../client/model/graph/graph";
import { LocatedBlockId } from "../../../client/model/graph/locatedBlock";
import { strToMode } from "../../../client/model/view";

// TODO - fill in routes for ""

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
  const viewProps = {
    mode: strToMode(mode),
    rootContentId,
    rootRelativePath: List<LocatedBlockId>() as Path,
    focusPath: null,
    focusPosition: null,
  };
  return (
    <GraphProvider>
      <ViewProvider {...viewProps} redirectToUrl={true}>
        <Tool />
      </ViewProvider>
    </GraphProvider>
  );
};

export default Container;
