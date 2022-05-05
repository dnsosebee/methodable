import { useState } from "react";
import { emojiButtonClasses, headingClasses } from "../../styles/styles";

export interface IEntryProps {
  humanText: string;
  showEntryCallback: () => void;
}

export const Entry = (props: IEntryProps) => {
  return (
    <div className={"flex flex-col h-max"}>
      <h1 className={headingClasses}>{props.humanText}</h1>
      <p className={"italic text-sm mb-5 flex-grow"}>A Human Program</p>
      <button
        onClick={props.showEntryCallback}
        className={`${emojiButtonClasses} p-2 text-gray-700 bg-gray-100 border-gray-200`}
      >
        Click here to begin
      </button>
    </div>
  );
};
