import React from "react";
import { Outlet } from "react-router-dom";
import MainNav from "../components/MainNav";

const Layout = () => {
  return (
    <div>
      <MainNav />

      <main className="mx-auto mt-2 px-4 h-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
