import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const LoadInfoToRedirect = () => {
  const [loading, setLoading] = useState(3);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoading((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          setRedirect(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (redirect) {
    return <Navigate to={'/'} />;
  }
  return (
    <div>
      <h1>Loading... {loading}</h1>
      <p>You will be redirected shortly.</p>
    </div>
  );
};

export default LoadInfoToRedirect;