// src/routes/RequireAuth.jsx
import { Navigate, Outlet } from "react-router-dom";
// ดึง user จาก store ของคุณ (ดูไฟล์ store/nopporn-stores.jsx)
// ถ้าใช้ context/Redux/Zustand ปรับให้ตรงของจริงได้เลย
import useNpStore from "../store/nopporn-stores";

const RequireAuth = ({ allowed = [] }) => {
  const user = useNpStore((s) => s.user); // คาดว่า { role, ... } หรือ null

  // ยังไม่ล็อกอิน
  if (!user) return <Navigate to="/login" replace />;

  // ระบุ allowed แล้วแต่ role ไม่อยู่ในลิสต์ -> ส่งไปหน้า 403
  if (allowed.length && !allowed.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  // ผ่าน
  return <Outlet />;
};

export default RequireAuth;
