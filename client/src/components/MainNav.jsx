import React, { use } from "react";
import { Link } from "react-router-dom";
import useNpStore from "../../src/store/nopporn-stores";

const MainNav = () => {
  // JavaScript
  const carts = useNpStore((state) => state.carts);


  return (
    <nav className="bg-blue-300">
      <div className="mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to={"/"} className="text-2xl font-bold">LOGO</Link>
            <Link to={"/"}>Home</Link>
            <Link to={"/shop"}>Shop</Link>
            <Link to={"/cart"} className="relative py-4">
            Cart
              {
              carts.length > 0 
              && (<span className="absolute top-0 bg-red-500 rounded-full px-2">{carts.length}</span>)
              }
            </Link>
          </div>

          <div className="flex items-center gap-4 ">
            <Link to={"register"}>Register</Link>
            <Link to={"login"}>Login</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNav;
