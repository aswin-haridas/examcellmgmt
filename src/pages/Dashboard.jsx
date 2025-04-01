import React, { useEffect, useState } from "react";
import StudentDashboard from "../components/dashboard/StudentDashboard";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import FacultyDashboard from "../components/dashboard/FacultyDashboard";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get user info from session storage
    const storedUserId = sessionStorage.getItem("user");
    const role = sessionStorage.getItem("role");

    if (storedUserId && role) {
      setUserId(storedUserId);
      setUserRole(role);
    }

    setLoading(false);
  }, []);

  // Render the appropriate dashboard based on user role
  const renderDashboardByRole = () => {
    if (loading) {
      return <div className="text-gray-600">Loading dashboard...</div>;
    }

    switch (userRole) {
      case "student":
        return <StudentDashboard userId={userId} />;
      case "admin":
        return <AdminDashboard userId={userId} />;
      case "faculty":
        return <FacultyDashboard userId={userId} />;
      default:
        return (
          <div className="text-center py-6 bg-white shadow-md rounded-lg mb-8">
            <p className="text-gray-500">
              Unable to determine user role. Please log in again.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      {renderDashboardByRole()}
    </div>
  );
};

export default Dashboard;
