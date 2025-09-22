import React, { useState, useEffect } from "react";
import useNpStore from "../store/nopporn-stores";
import { currentAdmin, currentEmployee } from "../api/authen";
import LoadInfoToRedirect from "./loadinfToRedirect";

const ProtectRouteAdmin = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const user = useNpStore((state) => state.user);
  const token = useNpStore((state) => state.token);

  useEffect(() => {
    if (["admin", "employee"].includes(res.data.role?.toLowerCase())) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return isAuthenticated ? element : <LoadInfoToRedirect />;
};

export default ProtectRouteAdmin;
