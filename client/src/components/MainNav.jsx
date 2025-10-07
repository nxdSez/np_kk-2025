import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import useNpStore from "../../src/store/nopporn-stores";
import { ChevronDown, Menu, X } from "lucide-react";

const MainNav = () => {
  const carts = useNpStore((s) => s.carts);
  const user = useNpStore((s) => s.user);
  const token = useNpStore((s) => s.token);
  const LogOut = useNpStore((s) => s.LogOut);
  const loadMe = useNpStore((s) => s.loadMe);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleUserMenu = () => setUserMenuOpen((s) => !s);
  const toggleMobile = () => setMobileOpen((s) => !s);

  useEffect(() => {
    if (token && user && !user.name) loadMe();
    if (!user) setUserMenuOpen(false);
  }, [token, user?.id]);

  const displayName = useMemo(
    () => (user?.name?.trim?.() || user?.email || "ผู้ใช้"),
    [user?.name, user?.email]
  );

  const initials = useMemo(() => {
    const parts = displayName.split(" ").filter(Boolean).slice(0, 2);
    return parts.map((s) => s[0]?.toUpperCase() || "").join("") || "U";
  }, [displayName]);

  const roleBadge = useMemo(() => {
    if (user?.role === "admin")
      return { label: "Admin", cls: "bg-red-100 text-red-700 ring-1 ring-red-200" };
    if (user?.role === "employee")
      return { label: "Employee", cls: "bg-amber-100 text-amber-700 ring-1 ring-amber-200" };
    return { label: "", cls: "" };
  }, [user?.role]);

  const NavItem = ({ to, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium ${
          isActive ? "bg-blue-400 text-black" : "hover:bg-blue-400 text-black"
        }`
      }
      onClick={() => setMobileOpen(false)}
    >
      {children}
    </NavLink>
  );

  return (
    <nav className="bg-blue-300">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobile}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-white/40"
              aria-label="Open menu"
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>

            <Link to="/" className="text-xl md:text-2xl font-bold">
              นพพรการค้า
            </Link>

            {/* Desktop menu */}
            <div className="hidden lg:flex items-center gap-1 ml-4">
              <NavItem to="/">Home</NavItem>
              <NavItem to="/shop">Shop</NavItem>
              <div className="relative">
                <NavItem to="/cart">
                  <span className="relative">
                    Cart
                    {carts.length > 0 && (
                      <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs px-1.5 rounded-full">
                        {carts.length}
                      </span>
                    )}
                  </span>
                </NavItem>
              </div>
            </div>
          </div>

          {/* Right */}
          {user ? (
            <div className="relative flex items-center gap-2">
              <button
                className="flex items-center gap-3 px-2.5 py-1.5 rounded-2xl hover:bg-white/30"
                onClick={toggleUserMenu}
              >
                <div className="w-9 h-9 rounded-full bg-white/80 text-slate-700 grid place-items-center text-sm font-bold ring-2 ring-white/70">
                  {initials}
                </div>
                <div className="hidden md:flex flex-col items-start leading-tight text-slate-900">
                  <span className="max-w-[160px] truncate font-semibold">
                    {user.role === "customer"
                      ? displayName
                      : `${displayName} · ${roleBadge.label}`}
                  </span>
                  {user.role !== "customer" && roleBadge.label && (
                    <span
                      className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${roleBadge.cls}`}
                    >
                      {roleBadge.label}
                    </span>
                  )}
                </div>
                <ChevronDown />
              </button>

              {/* user dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-56 rounded-2xl bg-white shadow-lg ring-1 ring-black/5 z-10">
                  <ul className="py-1 text-sm">
                    <li>
                      <Link
                        to="/user/history"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-slate-50"
                      >
                        คำสั่งซื้อของฉัน
                      </Link>
                    </li>
                    {(user.role === "admin" || user.role === "employee") && (
                      <li>
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 hover:bg-slate-50"
                        >
                          ไปหน้า Admin
                        </Link>
                      </li>
                    )}
                    <li>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          LogOut();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <NavItem to="/register">Register</NavItem>
              <NavItem to="/login">Login</NavItem>
            </div>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition ${
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute top-0 h-full w-72 bg-white shadow-xl p-4 transition-transform ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-4">
            <Link
              to="/"
              className="text-lg font-bold"
              onClick={() => setMobileOpen(false)}
            >
              นพพรการค้า
            </Link>
          </div>
          <nav className="flex flex-col gap-1">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/shop">Shop</NavItem>
            <NavItem to="/cart">
              <span className="flex items-center justify-between">
                Cart
                {carts.length > 0 && (
                  <span className="ml-2 bg-red-600 text-white text-xs px-1.5 rounded-full">
                    {carts.length}
                  </span>
                )}
              </span>
            </NavItem>
            {!user && (
              <>
                <NavItem to="/register">Register</NavItem>
                <NavItem to="/login">Login</NavItem>
              </>
            )}
          </nav>
        </div>
      </div>
    </nav>
  );
};

export default MainNav;
