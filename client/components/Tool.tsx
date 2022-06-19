import { GraphProvider } from "./GraphProvider";

export const Tool = ({ children }) => {
  return (
    <GraphProvider>
      <div className="flex flex-col max-h-full">{children}</div>
    </GraphProvider>
  );
};
