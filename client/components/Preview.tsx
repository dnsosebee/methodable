import { Editor } from "./editor/Editor";
import { useGraph } from "./GraphProvider";
import { Guide } from "./guide/Guide";
import { useView } from "./ViewProvider";

export const Preview = () => {
  const { graphState } = useGraph();
  const { viewState } = useView();
  return (
    <div className="flex-grow flex h-full">
      <div className="flex-1">
        <Editor />
      </div>
      <div className="flex-1 flex">
        <Guide {...{ graphState, viewState }} />
      </div>
    </div>
  );
};
