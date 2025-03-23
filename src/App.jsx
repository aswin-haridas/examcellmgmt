import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { StudentDashboard } from "./pages/StudentDashboard";
import Layout from "./components/Layout";
import CoursesPage from "./pages/CoursesPage";
import ExamSchedulePage from "./pages/ExamSchedulePage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import LogoutPage from "./pages/LogoutPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />

        {/* Student Routes */}
        <Route path="/student-dashboard" element={<Layout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="exam-schedule" element={<ExamSchedulePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="logout" element={<LogoutPage />} />
        </Route>

        {/* Faculty Routes - can add additional faculty specific pages */}
        <Route path="/faculty-dashboard" element={<Layout />}>
          <Route index element={<div>Faculty Dashboard</div>} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="logout" element={<LogoutPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<Layout />}>
          <Route index element={<div>Admin Dashboard</div>} />
          <Route path="logout" element={<LogoutPage />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
