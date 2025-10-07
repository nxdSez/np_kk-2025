import React from "react";

function getInitials(name = "U") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

function roleBadge(role) {
  if (role === "admin") return { label: "Admin", cls: "bg-red-100 text-red-700 ring-1 ring-red-200" };
  if (role === "employee") return { label: "Employee", cls: "bg-amber-100 text-amber-700 ring-1 ring-amber-200" };
  return { label: "", cls: "" };
}

export default function UserChip({ user, onSignOut }) {
  if (!user) return null;

  const isCustomer = user.role === "customer";
  const badge = roleBadge(user.role);
  const displayName = user.name?.trim?.() || user.email || "ผู้ใช้";

  return (
    <div className="relative group">
      <button className="flex items-center gap-3 rounded-2xl bg-white/30 hover:bg-white/40 px-3 py-2 shadow-sm">
        {/* Avatar */}
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={displayName} className="h-8 w-8 rounded-full object-cover ring-2 ring-white/70" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-white/80 text-slate-700 grid place-items-center text-sm font-bold ring-2 ring-white/70">
            {getInitials(displayName)}
          </div>
        )}

        {/* Texts */}
        <div className="hidden md:flex flex-col items-start leading-tight text-slate-900">
          <span className="max-w-[180px] truncate font-semibold">
            {isCustomer ? displayName : `${displayName} · ${badge.label}`}
          </span>

          {!isCustomer && badge.label && (
            <span className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${badge.cls}`}>
              {badge.label}
            </span>
          )}
          {isCustomer && user.email && <span className="text-[11px] text-slate-600">{user.email}</span>}
        </div>

        {/* caret */}
        <svg className="h-4 w-4 text-slate-700 ml-1" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-lg ring-1 ring-black/5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
        <div className="px-4 py-3 border-b">
          <p className="text-sm font-semibold truncate">{displayName}</p>
          {!isCustomer ? <p className="text-xs text-slate-600">{badge.label}</p> : <p className="text-xs text-slate-600">{user.email}</p>}
        </div>
        <ul className="py-1 text-sm">
          <li><a href="/profile" className="block px-4 py-2 hover:bg-slate-50">โปรไฟล์</a></li>
          {(user.role === "admin" || user.role === "employee") && (
            <li><a href="/admin" className="block px-4 py-2 hover:bg-slate-50">ไปหน้า Admin</a></li>
          )}
          {user.role === "customer" && (
            <li><a href="/orders" className="block px-4 py-2 hover:bg-slate-50">คำสั่งซื้อของฉัน</a></li>
          )}
          <li>
            <button onClick={onSignOut} className="w-full text-left px-4 py-2 hover:bg-slate-50">ออกจากระบบ</button>
          </li>
        </ul>
      </div>
    </div>
  );
}
