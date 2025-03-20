import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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
        <Route path="/" element={<Layout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="exam-schedule" element={<ExamSchedulePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="logout" element={<LogoutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
