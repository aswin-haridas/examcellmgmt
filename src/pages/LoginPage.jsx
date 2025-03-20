import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Snackbar, Alert } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

// Hardcoded Users
const USERS = {
  "student@gmail.com": { password: "student123", role: "student" },
  "faculty@gmail.com": { password: "faculty123", role: "faculty" },
};

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFacultyLogin, setIsFacultyLogin] = useState(false);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (USERS[email] && USERS[email].password === password) {
      const expectedRole = isFacultyLogin ? "faculty" : "student";
      if (USERS[email].role === expectedRole) {
        navigate(
          expectedRole === "student"
            ? "/student-dashboard"
            : "/faculty-dashboard"
        );
      } else {
        showError("Invalid role selection for this email.");
      }
    } else {
      showError("Invalid email or password.");
    }
  };

  const showError = (message) => {
    setError(message);
    setOpenSnackbar(true);
  };

  const handleSwitch = () => {
    setIsFacultyLogin(!isFacultyLogin);
  };

  const formVariants = {
    initial: (direction) => ({
      x: direction === "faculty" ? "100%" : "-100%",
      opacity: 0,
    }),
    animate: { x: 0, opacity: 1 },
    exit: (direction) => ({
      x: direction === "faculty" ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <div className="relative w-full max-w-3xl min-h-[480px] bg-white rounded-lg shadow-2xl overflow-hidden my-10">
        <div className="flex h-full ">
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
            <AnimatePresence
              mode="wait"
              custom={isFacultyLogin ? "faculty" : "student"}
            >
              <motion.div
                key={isFacultyLogin ? "faculty" : "student"}
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                custom={isFacultyLogin ? "faculty" : "student"}
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                    className="w-full bg-orange-500 text-white font-bold py-3 rounded-full uppercase tracking-wide mb-4  focus:outline-orange-500 focus:outline-2"
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ backgroundColor: "#dd6b20" }}
                  >
                    Login
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

      {/* Snackbar */}
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
