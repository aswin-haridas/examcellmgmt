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

const Sidebar = ({ role }) => {
  const location = useLocation();
  const path = location.pathname;

  // Get the proper dashboard path for the role
  const getDashboardPath = (role) => {
    if (role === "admin") return "/admin-dashboard";
    return `/${role}-dashboard`;
  };

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
        {/* Common link for all roles */}
        <Link to={getDashboardPath(role)}>
          <SidebarItem
            icon={<Home size={20} />}
            text="Dashboard"
            active={path === getDashboardPath(role)}
          />
        </Link>

        {/* Conditional rendering based on user role */}
        {role === "admin" ? (
          // Admin-specific sidebar items
          <>
            <Link to={`/users`}>
              <SidebarItem
                icon={<Users size={20} />}
                text="User Management"
                active={path.startsWith(`/users`)}
              />
            </Link>
            <Link to={`/exams`}>
              <SidebarItem
                icon={<FileText size={20} />}
                text="Exam Management"
                active={path.startsWith(`/exams`)}
              />
            </Link>
            <Link to={`/classrooms`}>
              <SidebarItem
                icon={<Building size={20} />}
                text="Classrooms"
                active={path.startsWith(`/classrooms`)}
              />
            </Link>
            <Link to={`/seating`}>
              <SidebarItem
                icon={<ClipboardList size={20} />}
                text="Seating Plans"
                active={path.startsWith(`/seating`)}
              />
            </Link>
            <Link to={`/invigilation`}>
              <SidebarItem
                icon={<CalendarIcon size={20} />}
                text="Invigilation Duties"
                active={path.startsWith(`/invigilation`)}
              />
            </Link>
          </>
        ) : (
          // Student and faculty common items
          <>
            <Link to={`/exam-schedule`}>
              <SidebarItem
                icon={<CalendarIcon size={20} />}
                text="Exam Schedule"
                active={path.startsWith(`/exam-schedule`)}
              />
            </Link>
            <Link to={`/notifications`}>
              <SidebarItem
                icon={<Bell size={20} />}
                text="Notifications"
                active={path === `/notifications`}
              />
            </Link>
          </>
        )}

        {/* Common items for all roles */}
        <Link to={`/profile`}>
          <SidebarItem
            icon={<User size={20} />}
            text="Profile"
            active={path === `/profile`}
          />
        </Link>
        <Link to={`/settings`}>
          <SidebarItem
            icon={<Settings size={20} />}
            text="Settings"
            active={path === `/settings`}
          />
        </Link>
        <div className="mt-auto mb-6">
          <div onClick={onclickLogout}>
            {" "}
            {/* This is correct usage now */}
            <SidebarItem icon={<LogOut size={20} />} text="Logout" />
          </div>
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
      className={`
        flex items-center px-6 py-3 cursor-pointer transition-all duration-200
        ${
          active
            ? "bg-gray-100 text-gray-900 font-medium border-r-4 border-gray-900"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }
        ${className || ""}
      `}
    >
      <div className={`mr-3 ${active ? "text-gray-900" : "text-gray-500"}`}>
        {icon}
      </div>
      <span className="text-sm">{text}</span>
    </div>
  );
};

export default Sidebar;
