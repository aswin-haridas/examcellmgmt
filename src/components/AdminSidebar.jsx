import React from "react";
import { Link, useLocation } from "react-router-dom";

export const AdminSidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/admin", label: "Dashboard" },
    { path: "/admin/users", label: "User Management" },
    { path: "/admin/exams", label: "Exam Management" },
    { path: "/admin/classrooms", label: "Classroom Management" },
    { path: "/admin/seating", label: "Seating Plans" },
    { path: "/admin/invigilation", label: "Invigilation Duties" },
    { path: "/admin/profile", label: "Profile" },
    { path: "/admin/settings", label: "Settings" },
    { path: "/admin/logout", label: "Logout" },
  ];

  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Portal</h1>
      </div>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className="mb-2">
              <Link
                to={item.path}
                className={`block p-2 rounded ${
                  isActive(item.path) ? "bg-black" : "hover:bg-gray-700"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
