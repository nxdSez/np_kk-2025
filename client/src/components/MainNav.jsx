import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import useNpStore from "../../src/store/nopporn-stores";
import { ChevronDown } from "lucide-react";

const MainNav = () => {
  // Store
  const carts = useNpStore((state) => state.carts);
  const user = useNpStore((state) => state.user);
  const token = useNpStore((state) => state.token);
  const LogOut = useNpStore((state) => state.LogOut);
  const loadMe = useNpStore((state) => state.loadMe);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const toggleUserMenu = () => setUserMenuOpen((s) => !s);

  // ถ้าล็อกอินแล้วแต่ยังไม่มี name ให้โหลดโปรไฟล์เต็ม
  useEffect(() => {
    if (token && user && !user.name) {
      loadMe();
    }
    // ปิดเมนูเวลาล็อกเอาท์
    if (!user) setUserMenuOpen(false);
  }, [token, user?.id]);

  // ---- Helpers (แสดงชื่อ/ป้ายบทบาท/ตัวอักษรย่อ) ----
  const displayName = useMemo(() => {
    return (user?.name && user.name.trim()) || user?.email || "ผู้ใช้";
  }, [user?.name, user?.email]);

  const initials = useMemo(() => {
    const parts = (displayName || "").split(" ").filter(Boolean).slice(0, 2);
    return parts.map((s) => s[0]?.toUpperCase() || "").join("") || "U";
  }, [displayName]);

  const roleBadge = useMemo(() => {
    if (user?.role === "admin")
      return { label: "Admin", cls: "bg-red-100 text-red-700 ring-1 ring-red-200" };
    if (user?.role === "employee")
      return { label: "Employee", cls: "bg-amber-100 text-amber-700 ring-1 ring-amber-200" };
    return { label: "", cls: "" };
  }, [user?.role]);

  return (
    <nav className="bg-blue-300">
      <div className="mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Left: Brand + Menu */}
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

          {/* Right: Register/Login OR UserChip */}
          {user ? (
            <div className="relative flex items-center gap-4">
              <button
                className="flex items-center gap-3 px-3 py-2 z-10 rounded-2xl hover:bg-white/30"
                onClick={toggleUserMenu}
              >
                {/* Avatar/Initials */}
                <div className="w-10 h-10 rounded-full bg-white/80 text-slate-700 grid place-items-center text-sm font-bold ring-2 ring-white/70">
                  {initials}
                </div>

                {/* Texts */}
                <div className="hidden md:flex flex-col items-start leading-tight text-slate-900">
                  <span className="max-w-[180px] truncate font-semibold">
                    {user.role === "customer" ? displayName : `${displayName} · ${roleBadge.label}`}
                  </span>

                  {user.role !== "customer" && roleBadge.label && (
                    <span className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${roleBadge.cls}`}>
                      {roleBadge.label}
                    </span>
                  )}
                  {user.role === "customer" && user.email && (
                    <span className="text-[11px] text-slate-700">{user.email}</span>
                  )}
                </div>

                <ChevronDown />
              </button>

              {userMenuOpen && (
                <div className="absolute right-4 top-16 bg-white border rounded-md shadow-lg p-2 w-56 z-50">
                  {/* ลิงก์โปรไฟล์/ประวัติคำสั่งซื้อเดิม */}
                  <Link
                    to="/user/history"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                  >
                    History
                  </Link>

                  {/* ลิงก์เฉพาะบทบาท */}
                  {(user.role === "admin" || user.role === "employee") && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                    >
                      ไปหน้า Admin
                    </Link>
                  )}
                  {user.role === "customer" && (
                    <Link
                      to="/user/history"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                    >
                      คำสั่งซื้อของฉัน
                    </Link>
                  )}

                  <Link
                    onClick={() => LogOut()}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                    to="/"
                  >
                    Logout
                  </Link>
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
  