// src/pages/admin/components/Header.jsx (หรือที่ไฟล์ Header.jsx ของคุณ)
import React from "react";
import { Link } from "react-router-dom";
import useNpStore from "../../../src/store/nopporn-stores"; // ปรับ path ให้ตรงโปรเจกต์คุณ

const TITLE_BY_ROLE = {
  admin: "ระบบหลังร้าน · แอดมิน",
  employee: "ระบบหลังร้าน · พนักงาน",
};

export default function Header() {
  const user = useNpStore((s) => s.user);

  const title =
    (user?.role && TITLE_BY_ROLE[user.role]) || "";

  return (
    <header className="bg-white h-16 flex items-center justify-between px-4 border-b">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← กลับหน้า Home
        </Link>
        <h1 className="text-xl font-bold">{title}</h1>
      </div>

      <div className="text-sm text-slate-600 ml-auto flex item-center gap-2">
        {user?.name ? <>สวัสดี, <span className="font-medium">{user.name}</span></> : null}
      </div>
    </header>
  );
}
