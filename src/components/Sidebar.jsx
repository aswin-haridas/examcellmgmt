import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  BookOpen,
  Calendar as CalendarIcon,
  Home,
  LogOut,
  Settings,
  User,
  Users,
  FileText,
  ClipboardList,
  Building,
} from "lucide-react";
import { logout } from "../services/auth";

// Define all sidebar items with their roles
const sidebarItems = [
  {
    to: (role) => getDashboardPath(role),
    icon: <Home size={20} />,
    text: "Dashboard",
    roles: ["admin", "faculty", "student"],
    isActive: (path, role) => path === getDashboardPath(role),
  },
  {
    to: "/users",
    icon: <Users size={20} />,
    text: "User Management",
    roles: ["admin"],
    isActive: (path) => path.startsWith("/users"),
  },
  {
    to: "/exams",
    icon: <FileText size={20} />,
    text: "Exam Management",
    roles: ["admin"],
    isActive: (path) => path.startsWith("/exams"),
  },
  {
    to: "/classrooms",
    icon: <Building size={20} />,
    text: "Classrooms",
    roles: ["admin", "faculty", "student"],
    isActive: (path) => path.startsWith("/classrooms"),
  },
  {
    to: "/invigilation",
    icon: <CalendarIcon size={20} />,
    text: "Invigilation Duties",
    roles: ["admin", "faculty"],
    isActive: (path) => path.startsWith("/invigilation"),
  },
  {
    to: "/exam-schedule",
    icon: <CalendarIcon size={20} />,
    text: "Exam Schedule",
    roles: ["faculty", "student"],
    isActive: (path) => path.startsWith("/exam-schedule"),
  },
  {
    to: "/notifications",
    icon: <Bell size={20} />,
    text: "Notifications",
    roles: ["faculty", "student"],
    isActive: (path) => path === "/notifications",
  },
  {
    to: "/profile",
    icon: <User size={20} />,
    text: "Profile",
    roles: ["admin", "faculty", "student"],
    isActive: (path) => path === "/profile",
  },
  {
    to: "/settings",
    icon: <Settings size={20} />,
    text: "Settings",
    roles: ["admin", "faculty", "student"],
    isActive: (path) => path === "/settings",
  },
];

// Get the proper dashboard path for the role
const getDashboardPath = (role) => {
  if (role === "admin") return "/admin-dashboard";
  return `/${role}-dashboard`;
};

const Sidebar = ({ role }) => {
  const location = useLocation();
  const path = location.pathname;

  const onclickLogout = () => {
    logout();
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-black">ExamCell</h2>
        <p className="text-gray-600 text-sm mt-1">
          {role === "admin"
            ? "Admin Portal"
            : role === "faculty"
            ? "Faculty Portal"
            : "Student Portal"}
        </p>
      </div>
      <nav className="mt-2 flex flex-col h-[calc(100vh-150px)]">
        {/* Map through sidebar items and filter by role */}
        {sidebarItems
          .filter((item) => item.roles.includes(role))
          .map((item, index) => (
            <Link
              key={index}
              to={typeof item.to === "function" ? item.to(role) : item.to}
            >
              <SidebarItem
                icon={item.icon}
                text={item.text}
                active={item.isActive(path, role)}
              />
            </Link>
          ))}

        <div className="mt-auto mb-6">
          <Link to="/" onClick={onclickLogout}>
            <SidebarItem icon={<LogOut size={20} />} text="Logout" />
          </Link>
        </div>
        <div>
          <SidebarItem
            icon={<FileText size={20} />}
            text={JSON.parse(localStorage.getItem("user"))?.name}
          />
        </div>
      </nav>
    </div>
  );
};

// Sidebar item component
const SidebarItem = ({ icon, text, active, className }) => {
  return (
    <div
      className={`flex items-center px-6 py-3 cursor-pointer transition-all duration-200 ${
        active
          ? "bg-gray-100 text-gray-900 font-medium border-r-4 border-gray-900"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      } ${className || ""}`}
    >
      <div className={`mr-3 ${active ? "text-gray-900" : "text-gray-500"}`}>
        {icon}
      </div>
      <span className="text-sm">{text}</span>
    </div>
  );
};

export default Sidebar;
