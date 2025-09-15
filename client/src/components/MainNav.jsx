import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import useNpStore from "../../src/store/nopporn-stores";
import { ChevronDown } from "lucide-react";

const MainNav = () => {
  // JavaScript
  const carts = useNpStore((state) => state.carts);
  const user = useNpStore((state) => state.user);
  const LogOut = useNpStore((state) => state.LogOut);
  // console.log("user in nav", Boolean(user));

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <nav className="bg-blue-300">
      <div className="mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to={"/"} className="text-2xl font-bold">
              นพพรการค้า
            </Link>
            <NavLink
              className={({ isActive }) =>
                isActive
                  ? "bg-blue-400 px-3 py-2 rounded-md text-black text-sm font-medium"
                  : " px-3 py-2 rounded-md text-black text-sm font-medium hover:bg-blue-400"
              }
              to={"/"}
            >
              Home
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                isActive
                  ? "bg-blue-400 px-3 py-2 rounded-md text-black text-sm font-medium"
                  : " px-3 py-2 rounded-md text-black text-sm font-medium hover:bg-blue-400"
              }
              to={"/shop"}
            >
              Shop
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                isActive
                  ? "bg-blue-400 px-3 py-2 rounded-md text-black text-sm font-medium"
                  : " px-3 py-2 rounded-md text-black text-sm font-medium hover:bg-blue-400"
              }
              to={"/cart"}
            >
              Cart
              {carts.length > 0 && (
                <span className="absolute top-0 bg-red-500 rounded-full px-2">
                  {carts.length}
                </span>
              )}
            </NavLink>
          </div>

          {user ? (
            <div className="relative flex items-center gap-4 ">
              <button
                className="flex items-center gap-2 px-3 py-2 z-10"
                onClick={toggleUserMenu}
              >
                <img
                  className="w-10 h-10 rounded-full"
                  alt="User Avatar"
                  src="https://cdn.iconscout.com/icon/premium/png-512-thumb/avatar-icon-svg-png-download-4005502.png?f=webp&w=256"
                />
                <ChevronDown />
              </button>
              {userMenuOpen && (
                <div className="absolute right-4 top-16 bg-white border rounded-md shadow-lg p-4 w-48">
                  <Link
                    to="/user/history"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                  >
                    History
                  </Link>
                  <button
                    onClick={() => LogOut()}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4 ">
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "bg-blue-400 px-3 py-2 rounded-md text-black text-sm font-medium"
                    : " px-3 py-2 rounded-md text-black text-sm font-medium hover:bg-blue-400"
                }
                to={"register"}
              >
                Register
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "bg-blue-400 px-3 py-2 rounded-md text-black text-sm font-medium"
                    : " px-3 py-2 rounded-md text-black text-sm font-medium hover:bg-blue-400"
                }
                to={"login"}
              >
                Login
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MainNav;
