import Link from "next/link";
import { genericButtonClasses, instructionClasses } from "../../styles/styles";

export interface IDoPageProps {
  humanText: string;
  pathToNext: string;
}

export const DoPage = (props: IDoPageProps) => {
  return (<>
  <p className={instructionClasses}>{props.humanText}</p>
  <Link href={props.pathToNext}>
    <a>
      <button className={genericButtonClasses + " " + "text-gray-700 bg-gray-100 border-gray-200"}>
        Click here to continue
      </button>
    </a>
  </Link>
  </>
  )
};
