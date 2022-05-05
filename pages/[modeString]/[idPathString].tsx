import { useRouter } from "next/router";
import { ContextWrapper } from "../../client/components/ContextWrapper";
import { EditorContainer } from "../../client/components/editor/EditorContainer";
import { GuideContainer } from "../../client/components/guide/GuideContainer";
import FourOhFour from "../404";

const MODES = {
  EDIT: "edit",
  GUIDE: "guide",
};

// TODO - fill in routes for ""
const getChildComponent = (mode: string) => {
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
  let { modeString, idPathString } = router.query;
  if (modeString instanceof Array) {
    modeString = modeString[0];
  }
  if (idPathString instanceof Array) {
    idPathString = idPathString[0];
  }
  idPathString = idPathString ? idPathString : "";
  const idPath = idPathString.split(",");

  return <ContextWrapper idPath={idPath}>{getChildComponent(modeString)}</ContextWrapper>;
};

export default Container;
