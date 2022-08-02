import Link from "next/link";

export interface IHeaderProps {
  children: React.ReactNode;
}

export const Header = (props: IHeaderProps) => {
  return (
    <div className="flex">
      <Link href="/">
        <button className="text-2xl font-bold font-sans mb-2 hover:underline text-black italic">
          Methodable
        </button>
      </Link>
      <div className="flex-grow"></div>
      {props.children}
    </div>
  );
};
