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
          <Editor />
        </EditorProvider>
      );
    case MODE.GUIDE:
      return <Guide />;
    case MODE.FINISH:
      return <Exit />;
    default:
      return <FourOhFour />;
  }
};

export const View = (props: IViewData) => {
  return <ViewProvider {...props}>{getChildComponent(props.mode)}</ViewProvider>;
};
