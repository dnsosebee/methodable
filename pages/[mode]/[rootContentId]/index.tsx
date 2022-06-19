import { List } from "immutable";
import { useRouter } from "next/router";
import { Tool } from "../../../client/components/Tool";
import { View } from "../../../client/components/View";
import { Path } from "../../../client/model/graph/graph";
import { LocatedBlockId } from "../../../client/model/graph/locatedBlock";
import { strToMode } from "../../../client/model/view";

export const BASE_URL = "https://localhost:3000/";
export const SELECTION_RELATIVE_URL = "select/";
export const SELECTION_BASE_URL = BASE_URL + SELECTION_RELATIVE_URL;
export const PATH_DELIMITER = ",";
export const PATH_SEPARATOR = ";";

// TODO - fill in routes for ""

const Container = () => {
  const router = useRouter();
  let { mode, rootContentId } = router.query;
  console.log(mode, rootContentId);
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
    <Tool>
      <View {...viewProps} />
    </Tool>
  );
};

export default Container;
