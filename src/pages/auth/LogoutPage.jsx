import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authService } from "../../services/api";
import { Snackbar, Alert } from "@mui/material";

const LogoutPage = () => {
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const performLogout = async () => {
      try {
        await authService.logout();
        console.log("User logged out successfully");
      } catch (error) {
        setError(error.message || "Error logging out");
        setOpenSnackbar(true);
      }
    };

    performLogout();
  }, []);

  return (
    <>
      <Navigate to="/" replace />
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="error"
          variant="filled"
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LogoutPage;
