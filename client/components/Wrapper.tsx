import React from "react";

export const Wrapper = ({
  children,
  shouldGrow,
}: {
  children: React.ReactNode;
  shouldGrow: boolean;
}) => {
  const growClasses = shouldGrow ? "flex-grow" : "";
  return (
    <div
      className={`border border-secondary rounded p-2 shadow-lg flex flex-col max-h-full ${growClasses}`}
    >
      <div className="overflow-auto">{children}</div>
    </div>
  );
};
