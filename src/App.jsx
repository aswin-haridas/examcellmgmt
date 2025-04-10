import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import ExamPage from "./pages/ExamPage.jsx";
import SeatingArrangement from "./pages/seatingArrangement.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Classes from "./pages/Classes.jsx";
import InvigilationDuties from "./pages/InvigilationDuties.jsx";
import Users from "./pages/Users.jsx";
import { EditClassroom } from "./pages/editClassroom.jsx";
import SeatingGenForm from "./pages/SeatingGenForm.jsx";
import NotificationPage from "./pages/NotificationPage.jsx";

// Protected route component
const ProtectedRoute = () => {
  const isLoggedIn = sessionStorage.getItem("loggedIn") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <DashboardLayout />;
};

// Dashboard Layout component that includes the sidebar
const DashboardLayout = () => {
  const [role, setRole] = useState("student");

  // Get user role from sessionStorage on component mount
  useEffect(() => {
    const userRole = sessionStorage.getItem("role") || "student";
    setRole(userRole);
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <div className="flex-1 ml-64 overflow-auto">
        <Outlet /> {/* This renders the child routes */}
      </div>
    </div>
  );
};

function App() {
  // Check if user is already logged in
  const isLoggedIn = sessionStorage.getItem("loggedIn") === "true";

  return (
    <Router>
      <Routes>
        {/* Auth Route - No Sidebar */}
        <Route path="/" element={<LoginPage />} />

        {/* All dashboard routes are protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin-dashboard" element={<Dashboard />} />
          <Route path="/faculty-dashboard" element={<Dashboard />} />
          <Route path="/student-dashboard" element={<Dashboard />} />
          <Route path="/exam-schedule" element={<ExamPage />} />
          <Route path="/profile" element={<div>Profile Page</div>} />
          <Route path="/settings" element={<div>Settings Page</div>} />
          <Route path="/users" element={<Users />} />
          <Route path="/exams" element={<ExamPage />} />
          <Route path="/classrooms" element={<Classes />} />
          <Route path="/classrooms/class/:id" element={<EditClassroom />} />
          <Route
            path="/classrooms/arrange-seats/:id"
            element={<SeatingGenForm />}
          />
          <Route path="/seating" element={<SeatingArrangement />} />
          <Route path="/invigilation" element={<InvigilationDuties />} />
          <Route path="/notifications" element={<NotificationPage/>} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
