import React, { useState, useEffect } from "react";
import useNpStore from "../store/nopporn-stores";
import { currentUser } from "../api/authen";
import LoadInfoToRedirect from "./loadinfToRedirect";

const ProtectRouteUser = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const user = useNpStore((state) => state.user);
  const token = useNpStore((state) => state.token);

  useEffect(() => {
    if (user && token) {
      currentUser(token)
        .then((_res) => setIsAuthenticated(true))
        .catch((_err) => setIsAuthenticated(false));
    }
  }, []);

  return isAuthenticated ? element : <LoadInfoToRedirect />;
};

export default ProtectRouteUser;
