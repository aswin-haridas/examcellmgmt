import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Snackbar, Alert } from "@mui/material";
import { authService } from "../services/api";

export const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.login(email, password, "admin");
      navigate("/admin-dashboard");
    } catch (error) {
      showError(error.message || "Invalid admin email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  const showError = (message) => {
    setError(message);
    setOpenSnackbar(true);
  };

  const goToStudentFacultyLogin = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="relative w-full max-w-3xl min-h-[480px] bg-white rounded-lg shadow-2xl overflow-hidden">
        <div className="flex h-full">
          {/* Admin Login Form */}
          <div className="w-1/2 h-full flex items-center justify-center flex-col p-12">
            <form onSubmit={handleLogin} className="w-full text-center">
              <h1 className="text-3xl font-bold mb-6">Admin Login</h1>
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-200 border-none p-3 mb-4 rounded-lg"
                required
              />
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Admin Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-200 border-none p-3 mb-4 rounded-lg pr-10"
                  required
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </span>
              </div>
              <button
                type="submit"
                className={`w-full bg-orange-500 text-white font-bold py-3 rounded-full uppercase tracking-wide hover:bg-orange-600 transition-transform duration-75 active:scale-95 ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>

          {/* Right Panel */}
          <div className="w-1/2 bg-gradient-to-r from-orange-500 to-pink-500 text-white flex items-center justify-center flex-col p-10">
            <h1 className="text-3xl font-bold mb-4">Admin Portal</h1>
            <p className="mb-6 text-center">
              Login to access the admin dashboard and manage the AISAT Exam Cell
            </p>
            <button
              className="bg-transparent border border-white text-white font-bold py-3 px-12 rounded-full uppercase tracking-wide hover:bg-white hover:text-orange-500 transition-colors"
              onClick={goToStudentFacultyLogin}
            >
              Student/Faculty Login
            </button>
          </div>
        </div>
      </div>

      {/* Snackbar for Error Messages */}
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
    </div>
  );
};
