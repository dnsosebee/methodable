import { Wrapper } from "../client/components/Wrapper";
import { initialGraphJson } from "../client/data/initialState";

const reset = () => {
  const resetGraph = () => {
    if (
      window.confirm(
        "This will delete all changes you have ever made in Methodable. Are you sure you want to do this?"
      )
    ) {
      localStorage.setItem("graph", initialGraphJson);
      window.open("/", "_self");
    }
  };
  return (
    <Wrapper shouldGrow={false} className="bg-white">
      <div className="flex flex-column items-center justify-center">
        <button
          onClick={resetGraph}
          className="bg-red-400 grow p-auto rounded-xl border p-4 text-xl font-bold text-white"
        >
          Reset your graph
        </button>
      </div>
    </Wrapper>
  );
};

export default reset;
