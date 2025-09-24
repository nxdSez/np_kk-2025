// client/src/routes/ProtectRouteAdmin.jsx
import React, { useState, useEffect } from "react";
import useNpStore from "../store/nopporn-stores";
import { currentStaff } from "../api/authen";
import LoadInfoToRedirect from "./loadinfToRedirect";

const ProtectRouteAdmin = ({ element }) => {
  const [ok, setOk] = useState(false);
  const user = useNpStore((s) => s.user);
  const token = useNpStore((s) => s.token);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!user || !token) return setOk(false);
      try {
        const res = await currentStaff(token); // ✅ ตรวจสิทธิ์ที่ server (admin+employee)
        if (mounted) setOk(true);
      } catch (e) {
        if (mounted) setOk(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [user, token]);

  return ok ? element : <LoadInfoToRedirect />;
};

export default ProtectRouteAdmin;
