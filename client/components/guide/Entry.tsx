import { useState } from "react";

export interface IEntryProps {
  humanText: string;
  showEntryCallback: () => void;
}

export const Entry = (props: IEntryProps) => {
  return (
    <div className={"flex flex-col h-max"}>
      <h1>{props.humanText}</h1>
      <p className={"italic text-sm mb-5 flex-grow"}>A Human Program</p>
      <button
        onClick={props.showEntryCallback}
        className={`p-2 text-gray-700 bg-gray-100 border-gray-200`}
      >
        Click here to begin
      </button>
    </div>
  );
};
