import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";

const LogoutPage = () => {
  // In a real application, you would handle logout logic here
  // For example:
  useEffect(() => {
    // Clear user session/token
    // localStorage.removeItem('token');
    console.log("User logged out");
  }, []);

  // Redirect to login page or home page
  return <Navigate to="/" replace />;
};

export default LogoutPage;
