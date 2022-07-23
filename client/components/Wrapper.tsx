import React from "react";

export const Wrapper = ({
  children,
  shouldGrow,
  className,
}: {
  children: React.ReactNode;
  shouldGrow: boolean;
  className?: string;
}) => {
  const growClasses = shouldGrow ? "flex-grow" : "";
  return (
    <div
      className={`border border-secondary rounded-xl p-3 shadow-lg flex flex-col ${
        className ? className : ""
      } ${growClasses}`}
    >
      <div className="min-h-full">{children}</div>
    </div>
  );
};
