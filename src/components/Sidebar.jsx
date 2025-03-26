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

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  // Determine the user role based on the current path
  const role = path.startsWith("/student")
    ? "student"
    : path.startsWith("/faculty")
    ? "faculty"
    : path.startsWith("/admin")
    ? "admin"
    : "";

  return (
    <div className=" h-screen w-64 bg-white border-r border-gray-200 shadow-sm overflow-y-auto ">
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
        <Link to={`/${role}`}>
          <SidebarItem
            icon={<Home size={20} />}
            text="Dashboard"
            active={path === `/${role}`}
          />
        </Link>

        {/* Conditional rendering based on user role */}
        {role === "admin" ? (
          // Admin-specific sidebar items
          <>
            <Link to={`/${role}/users`}>
              <SidebarItem
                icon={<Users size={20} />}
                text="User Management"
                active={path.startsWith(`/${role}/users`)}
              />
            </Link>
            <Link to={`/${role}/exams`}>
              <SidebarItem
                icon={<FileText size={20} />}
                text="Exam Management"
                active={path.startsWith(`/${role}/exams`)}
              />
            </Link>
            <Link to={`/${role}/classrooms`}>
              <SidebarItem
                icon={<Building size={20} />}
                text="Classrooms"
                active={path.startsWith(`/${role}/classrooms`)}
              />
            </Link>
            <Link to={`/${role}/seating`}>
              <SidebarItem
                icon={<ClipboardList size={20} />}
                text="Seating Plans"
                active={path.startsWith(`/${role}/seating`)}
              />
            </Link>
            <Link to={`/${role}/invigilation`}>
              <SidebarItem
                icon={<CalendarIcon size={20} />}
                text="Invigilation Duties"
                active={path.startsWith(`/${role}/invigilation`)}
              />
            </Link>
          </>
        ) : (
          // Student and faculty common items
          <>
            <Link to={`/${role}/exam-schedule`}>
              <SidebarItem
                icon={<CalendarIcon size={20} />}
                text="Exam Schedule"
                active={path.startsWith(`/${role}/exam-schedule`)}
              />
            </Link>
            <Link to={`/${role}/notifications`}>
              <SidebarItem
                icon={<Bell size={20} />}
                text="Notifications"
                active={path === `/${role}/notifications`}
              />
            </Link>
          </>
        )}

        {/* Common items for all roles */}
        <Link to={`/${role}/profile`}>
          <SidebarItem
            icon={<User size={20} />}
            text="Profile"
            active={path === `/${role}/profile`}
          />
        </Link>
        <Link to={`/${role}/settings`}>
          <SidebarItem
            icon={<Settings size={20} />}
            text="Settings"
            active={path === `/${role}/settings`}
          />
        </Link>
        <div className="mt-auto mb-6">
          <Link to={`/${role}/logout`}>
            <SidebarItem icon={<LogOut size={20} />} text="Logout" />
          </Link>
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
