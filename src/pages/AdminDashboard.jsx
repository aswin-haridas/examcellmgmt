import React, { useState, useEffect } from "react";
import { adminService } from "../services/api";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";

// Extract ExamTable component to simplify the main component
const ExamTable = ({ exams, loading, formatDate }) => {
  if (loading) {
    return <div className="text-center py-4">Loading exams...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Course
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Venue
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {exams.slice(0, 5).map((exam) => (
            <tr key={exam.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {exam.subject}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {exam.course}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(exam.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {exam.time}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {exam.classrooms?.classname || "TBD"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState({
    users: true,
    exams: true,
    classrooms: true,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchExams();
    fetchClassrooms();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading((prev) => ({ ...prev, users: true }));
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(`Failed to fetch users: ${err.message}`);
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, users: false }));
    }
  };

  const fetchExams = async () => {
    try {
      setLoading((prev) => ({ ...prev, exams: true }));
      const data = await adminService.getAllExams();
      setExams(data);
    } catch (err) {
      setError(`Failed to fetch exams: ${err.message}`);
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, exams: false }));
    }
  };

  const fetchClassrooms = async () => {
    try {
      setLoading((prev) => ({ ...prev, classrooms: true }));
      const data = await adminService.getAllClassrooms();
      setClassrooms(data);
    } catch (err) {
      setError(`Failed to fetch classrooms: ${err.message}`);
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, classrooms: false }));
    }
  };

  const countUsersByRole = () => {
    const counts = { student: 0, faculty: 0, admin: 0 };
    users.forEach((user) => {
      if (counts.hasOwnProperty(user.role)) {
        counts[user.role]++;
      }
    });
    return counts;
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const userCounts = countUsersByRole();

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Admin Dashboard
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-800 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Users Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Students</span>
                <span className="font-bold">{userCounts.student}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Faculty</span>
                <span className="font-bold">{userCounts.faculty}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Admins</span>
                <span className="font-bold">{userCounts.admin}</span>
              </div>
            </div>
            <Link to="/admin/users">
              <button className="mt-4 w-full py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800">
                Manage Users
              </button>
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Exam Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Exams</span>
                <span className="font-bold">{exams.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Upcoming Exams</span>
                <span className="font-bold">
                  {
                    exams.filter((exam) => new Date(exam.date) > new Date())
                      .length
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span>Completed Exams</span>
                <span className="font-bold">
                  {
                    exams.filter((exam) => new Date(exam.date) <= new Date())
                      .length
                  }
                </span>
              </div>
            </div>
            <Link to="/admin/exams">
              <button className="mt-4 w-full py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800">
                Manage Exams
              </button>
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Classrooms</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Classrooms</span>
                <span className="font-bold">{classrooms.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Capacity</span>
                <span className="font-bold">
                  {classrooms.reduce(
                    (total, room) => total + (room.capacity || 0),
                    0
                  )}
                </span>
              </div>
            </div>
            <Link to="/admin/classrooms">
              <button className="mt-4 w-full py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800">
                Manage Classrooms
              </button>
            </Link>
          </div>
        </div>

        {/* Recent Exams Section - Simplified */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Recent Exams</h3>
              <p className="text-sm text-gray-500">
                Recently scheduled examinations
              </p>
            </div>
            <Link to="/admin/exams">
              <button className="py-2 px-4 text-sm text-black hover:text-blue-800">
                View All Exams
              </button>
            </Link>
          </div>
          <div className="p-4">
            <ExamTable
              exams={exams}
              loading={loading.exams}
              formatDate={formatDate}
            />
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/classrooms">
              <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                <h4 className="font-medium">Manage Seating Plans</h4>
                <p className="text-sm text-gray-500">
                  Create and edit seating arrangements
                </p>
              </div>
            </Link>
            <Link to="/admin/invigilation">
              <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                <h4 className="font-medium">Invigilation Duties</h4>
                <p className="text-sm text-gray-500">
                  Assign faculty to examination duties
                </p>
              </div>
            </Link>
            <Link to="/admin/users">
              <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                <h4 className="font-medium">Add New User</h4>
                <p className="text-sm text-gray-500">
                  Register new students, faculty or admin users
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
