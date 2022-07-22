import FourOhFour from "../../pages/404";
import { IViewData, MODE } from "../model/view";
import { Editor } from "./editor/Editor";
import { EditorProvider } from "./editor/EditorProvider";
import { Exit } from "./guide/Exit";
import { Guide } from "./guide/Guide";
import { ViewProvider } from "./ViewProvider";

export const getChildComponent = (mode: string) => {
  switch (mode) {
    case MODE.EDIT:
      return (
        <EditorProvider>
          <Editor showSearch={true} showOptions={true} shortenWrapper={true} />
        </EditorProvider>
      );
    case MODE.GUIDE:
      return <Guide shortenWrapper={true} />;
    case MODE.FINISH:
      return <Exit />;
    default:
      return <FourOhFour />;
  }
};

// renaming this file, along with auto-ordering of imports, breaks webpack :/ hence component has different name than file.
export const OuterView = (props: IViewData) => {
  return (
    <ViewProvider {...props} redirectToUrl={true}>
      {getChildComponent(props.mode)}
    </ViewProvider>
  );
};
