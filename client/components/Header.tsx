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
      {/* open in separate tab */}
      <Link href="https://github.com/dnsosebee/methodable" passHref={true}>
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="py-1 mb-2 px-3 mx-10 rounded-2xl bg-gray-200 shadow-lg"
        >
          View on GitHub
        </a>
      </Link>
      {props.children}
    </div>
  );
};
