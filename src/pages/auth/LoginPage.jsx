import React, { useState } from "react";
import { useNavigate, useRouteLoaderData } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Snackbar, Alert } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { login } from "../../services/auth";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isFacultyLogin, setIsFacultyLogin] = useState(false);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login(formData.email, formData.password);

      // Set loggedIn flag to true and store user details
      sessionStorage.setItem("loggedIn", "true");
      sessionStorage.setItem("role", user.role);
      sessionStorage.setItem("name", user.name);
      sessionStorage.setItem("user", user.id);

      // Map user role directly to route path
      const paths = {
        admin: "/admin-dashboard",
        faculty: "/faculty-dashboard",
        student: "/student-dashboard",
      };

      navigate(paths[user.role] || "/student-dashboard");
    } catch (error) {
      setError("Invalid email or password");
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitch = () => {
    setIsFacultyLogin(!isFacultyLogin);
    setFormData({ email: "", password: "" });
  };

  // Simplified animation variants
  const formVariants = {
    initial: {
      x: isFacultyLogin ? "100%" : "-100%",
      opacity: 0,
    },
    animate: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: isFacultyLogin ? "-100%" : "100%",
      opacity: 0,
    },
  };

  return (
    <div className="flex">
      <div className="flex-1 min-h-screen flex items-center justify-center bg-gray-100 py-10">
        <div className="relative w-full max-w-3xl min-h-[480px] bg-white rounded-lg shadow-2xl overflow-hidden my-10">
          <div className="flex h-full">
            {/* Form Container */}
            <motion.div
              className="w-1/2 h-full flex items-center justify-center"
              initial={false}
              animate={{
                x: isFacultyLogin ? "100%" : "0%",
                left: isFacultyLogin ? "50%" : "0%",
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isFacultyLogin ? "faculty" : "student"}
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="w-full flex items-center justify-center flex-col p-12"
                >
                  <form onSubmit={handleLogin} className="w-full text-center">
                    <h1 className="text-3xl font-bold mb-6">
                      {isFacultyLogin ? "Faculty Login" : "Student Login"}
                    </h1>
                    <div className="mb-4">
                      <label
                        htmlFor="email"
                        className="block text-left text-gray-700 mb-1"
                      >
                        {isFacultyLogin ? "Faculty Email" : "Student Email"}
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-gray-200 border-none p-3 rounded-lg"
                        required
                      />
                    </div>
                    <div className="mb-4 relative">
                      <label
                        htmlFor="password"
                        className="block text-left text-gray-700 mb-1"
                      >
                        Password
                      </label>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-gray-200 border-none p-3 rounded-lg pr-10"
                        required
                      />
                      <span
                        className="absolute right-3 top-1/2 transform -translate-y-1/4 cursor-pointer text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </span>
                    </div>
                    <motion.button
                      type="submit"
                      className={`w-full bg-orange-500 text-white font-bold py-3 rounded-full uppercase tracking-wide mb-4 focus:outline-orange-500 focus:outline-2 ${
                        isLoading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ backgroundColor: "#dd6b20" }}
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </motion.button>
                  </form>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Right Panel */}
            <motion.div
              className="w-1/2 h-full bg-gradient-to-r from-orange-500 to-pink-500 text-white flex items-center justify-center flex-col p-10"
              style={{ position: "absolute", height: "100%" }}
              initial={false}
              animate={{
                left: isFacultyLogin ? "0%" : "50%",
                x: "0%",
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <motion.h1
                className="text-3xl font-bold mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Welcome to AISAT
              </motion.h1>
              <motion.p
                className="mb-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Access your {isFacultyLogin ? "faculty" : "student"} portal to
                manage your academic activities
              </motion.p>
              <motion.button
                className="bg-transparent border border-white text-white font-bold py-3 px-12 rounded-full uppercase tracking-wide"
                onClick={handleSwitch}
                whileHover={{ backgroundColor: "#ffffff", color: "#ed8936" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {isFacultyLogin ? "Student Login" : "Faculty Login"}
              </motion.button>
            </motion.div>
          </div>
        </div>

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
    </div>
  );
};

export default LoginPage;
