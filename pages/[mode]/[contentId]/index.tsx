import { useRouter } from "next/router";
import { ContextWrapper } from "../../../client/components/ContextWrapper";
import { getChildComponent } from "./[locatedIdPath]";

const MODES = {
  EDIT: "edit",
  GUIDE: "guide",
};

const Container = () => {
  const router = useRouter();
  let { mode, contentId } = router.query;
  if (mode instanceof Array) {
    mode = mode[0];
  }
  if (contentId instanceof Array) {
    contentId = contentId[0];
  }
  // TODO this is a hack, I might need to use getInitialProps, or something
  if (!contentId) {
    return null;
  }
  return (
    <ContextWrapper contentId={contentId} idPath={[]}>
      {getChildComponent(mode, contentId, [])}
    </ContextWrapper>
  );
};

export default Container;
