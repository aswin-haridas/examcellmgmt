import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage";
import { StudentDashboard } from "./pages/StudentDashboard";
import CoursesPage from "./pages/CoursesPage";
import ExamSchedulePage from "./pages/ExamSchedulePage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import LogoutPage from "./pages/auth/LogoutPage";
import SeatingArr from "./pages/SeatingArrangement";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <div className="flex h-screen bg-mono-100">
      <div className="flex-1 p-4">
        {" "}
        {/* Add padding to the content area */}
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/" element={<LoginPage />} />

            {/* Student Routes */}
            <Route path="/student">
              <Route index element={<StudentDashboard />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="exam-schedule" element={<ExamSchedulePage />} />
              <Route path="seating-arrangement" element={<SeatingArr />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="logout" element={<LogoutPage />} />
            </Route>

            {/* Faculty Routes */}
            <Route path="/faculty">
              <Route index element={<div>Faculty Dashboard</div>} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="logout" element={<LogoutPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin">
              <Route index element={<AdminDashboard />} />
              <Route path="logout" element={<LogoutPage />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
