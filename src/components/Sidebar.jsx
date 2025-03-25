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
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="w-72 bg-white">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-black">ExamCell</h2>
        <p className="text-gray-600">Student Portal</p>
      </div>
      <nav className="mt-6 flex flex-col h-[calc(100%-96px)]">
        <Link to="/">
          <SidebarItem
            icon={<Home size={20} />}
            text="Dashboard"
            active={path === "/"}
          />
        </Link>
        <Link to="/courses">
          <SidebarItem
            icon={<BookOpen size={20} />}
            text="Courses"
            active={path === "/courses"}
          />
        </Link>
        <Link to="/exam-schedule">
          <SidebarItem
            icon={<CalendarIcon size={20} />}
            text="Exam Schedule"
            active={path === "/exam-schedule"}
          />
        </Link>
        <Link to="/notifications">
          <SidebarItem
            icon={<Bell size={20} />}
            text="Notifications"
            active={path === "/notifications"}
          />
        </Link>
        <Link to="/profile">
          <SidebarItem
            icon={<User size={20} />}
            text="Profile"
            active={path === "/profile"}
          />
        </Link>
        <Link to="/settings">
          <SidebarItem
            icon={<Settings size={20} />}
            text="Settings"
            active={path === "/settings"}
          />
        </Link>
        <div className="mt-auto">
          <Link to="/logout">
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
        flex items-center px-6 py-3 cursor-pointer
        ${
          active
            ? "bg-gray-100 text-black border-r-4 border-black"
            : "text-gray-600 hover:bg-gray-50"
        }
        ${className || ""}
      `}
    >
      <div className="mr-3">{icon}</div>
      <span>{text}</span>
    </div>
  );
};

export default Sidebar;
