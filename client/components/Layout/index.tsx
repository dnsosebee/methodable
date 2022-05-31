import React from "react";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {children}
    </div>
  );
};

export default Layout;
