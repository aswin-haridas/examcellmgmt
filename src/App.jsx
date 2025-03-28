import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import ExamPage from "./pages/ExamPage.jsx";
import SeatingArrangement from "./pages/seatingArrangement.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Sidebar from "./components/Sidebar.jsx";

// Dashboard Layout component that includes the sidebar
const DashboardLayout = () => {
  const [role, setRole] = useState("student");

  // Get user role from localStorage on component mount
  useEffect(() => {
    const userRole = localStorage.getItem("role") || "student";
    setRole(userRole);
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <div className="flex-1 ml-64 overflow-auto">
        {" "}
        {/* Added margin-left to match sidebar width */}
        <Outlet /> {/* This renders the child routes */}
      </div>
    </div>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);
  
  return (
    <Router>
      <Routes>
        {/* Auth Route - No Sidebar */}
        <Route path="/" element={<LoginPage />} />

        {/* Dashboard routes - With Sidebar */}
        <Route path="/"
          element={
            isLoggedIn ? <DashboardLayout /> : <Navigate to="/" replace />
          }
        >
          <Route path="/admin-dashboard" element={<Dashboard />} />
          <Route path="/faculty-dashboard" element={<Dashboard />} />
          <Route path="/student-dashboard" element={<Dashboard />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
