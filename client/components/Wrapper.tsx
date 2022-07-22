import React from "react";

export const Wrapper = ({
  children,
  shouldGrow,
  maxHClass,
}: {
  children: React.ReactNode;
  shouldGrow: boolean;
  maxHClass?: string;
}) => {
  const growClasses = shouldGrow ? "flex-grow" : "";
  return (
    <div
      className={`border border-secondary rounded p-2 shadow-lg flex flex-col ${
        maxHClass ? maxHClass : ""
      } ${growClasses}`}
    >
      <div className="min-h-full">{children}</div>
    </div>
  );
};
