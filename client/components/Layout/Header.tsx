// components/Layout/Header.tsx
import React from "react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0";
import Image from "next/image";

const Header = () => {
  const { user } = useUser();
  return (
    <header className="text-gray-600 body-font">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <Link href="/">
          <a className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
            <Image src="/intensh-logo.png" width="30px" height="30px" />
          </a>
        </Link>
        <button
          onClick={() => {
            console.log("\n\n");
          }}
        >
          log space
        </button>
        <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
          {/* {user && (
            <div className="flex itemx-center justify-center mr-5 capitalize bg-blue-500 py-1 px-3 rounded-md text-white">
              <Link href="/admin">
                <a>+ Create</a>
              </Link>
            </div>
          )} */}
          {user ? (
            <div className="flex items-center space-x-5">
              <Link href="/api/auth/logout">
                <a className="inline-flex items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0">
                  Logout
                </a>
              </Link>
              <img alt="profile" className="rounded-full w-12 h-12" src={user.picture} />
            </div>
          ) : (
            <Link href="/api/auth/login">
              <a className="inline-flex items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0">
                Login
              </a>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
