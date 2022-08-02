import { Header } from "../client/components/Header";
import { Wrapper } from "../client/components/Wrapper";

const reset = () => {
  const resetGraph = () => {
    if (
      window.confirm(
        "This will delete all changes you have ever made in Methodable. Are you sure you want to do this?"
      )
    ) {
      localStorage.setItem(
        "graph",
        '{"blockContents":[{ "id": "home", "verb": "DO", "humanText": "Home", "userId": "TODO", "archived": false }], "locatedBlocks": []}'
      );
      window.open("/", "_self");
    }
  };
  return (
    <>
      <Header>
        <></>
      </Header>
      <Wrapper shouldGrow={false} className="bg-white">
        <div className="flex flex-column items-center justify-center">
          <button
            onClick={resetGraph}
            className="bg-red-400 grow p-auto rounded-xl border p-4 text-xl font-bold text-white"
          >
            Reset to empty graph
          </button>
        </div>
      </Wrapper>
    </>
  );
};

export default reset;
