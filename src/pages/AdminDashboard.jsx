import React, { useState, useEffect } from "react";
import { adminService } from "../services/api";
import Sidebar from "../components/Sidebar";

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
  const [activeTab, setActiveTab] = useState("overview");

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

        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`py-3 px-6 ${
                activeTab === "overview"
                  ? "border-b-2 border-black font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`py-3 px-6 ${
                activeTab === "users"
                  ? "border-b-2 border-black font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("users")}
            >
              Manage Users
            </button>
            <button
              className={`py-3 px-6 ${
                activeTab === "exams"
                  ? "border-b-2 border-black font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("exams")}
            >
              Exam Management
            </button>
            <button
              className={`py-3 px-6 ${
                activeTab === "classrooms"
                  ? "border-b-2 border-black font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("classrooms")}
            >
              Classrooms
            </button>
          </div>
        </div>

        {activeTab === "overview" && (
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
              <button
                onClick={() => setActiveTab("users")}
                className="mt-4 w-full py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800"
              >
                Manage Users
              </button>
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
              <button
                onClick={() => setActiveTab("exams")}
                className="mt-4 w-full py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800"
              >
                Manage Exams
              </button>
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
              <button
                onClick={() => setActiveTab("classrooms")}
                className="mt-4 w-full py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800"
              >
                Manage Classrooms
              </button>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Users Management</h3>
                <p className="text-sm text-gray-500">
                  Add, edit or remove users
                </p>
              </div>
              <button className="py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800">
                Add New User
              </button>
            </div>
            <div className="p-4">
              {loading.users ? (
                <div className="text-center py-4">Loading users...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.slice(0, 10).map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : user.role === "faculty"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length > 10 && (
                    <div className="p-4 border-t text-center">
                      <button className="text-blue-600 hover:underline">
                        View all {users.length} users
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "exams" && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Exam Management</h3>
                <p className="text-sm text-gray-500">
                  Schedule, edit or cancel exams
                </p>
              </div>
              <button className="py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800">
                Add New Exam
              </button>
            </div>
            <div className="p-4">
              {loading.exams ? (
                <div className="text-center py-4">Loading exams...</div>
              ) : (
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {exams.map((exam) => (
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-2">
                              Edit
                            </button>
                            <button className="text-green-600 hover:text-green-900 mr-2">
                              Seating
                            </button>
                            <button className="text-purple-600 hover:text-purple-900">
                              Assign
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "classrooms" && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Classroom Management</h3>
                <p className="text-sm text-gray-500">
                  Add, edit or remove classrooms
                </p>
              </div>
              <button className="py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800">
                Add New Classroom
              </button>
            </div>
            <div className="p-4">
              {loading.classrooms ? (
                <div className="text-center py-4">Loading classrooms...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classrooms.map((room) => (
                    <div
                      key={room.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-medium">
                          {room.classname}
                        </h4>
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                          Capacity: {room.capacity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {room.description || "No description"}
                      </p>
                      <div className="flex justify-end space-x-2 mt-3">
                        <button className="text-sm text-blue-600 hover:text-blue-900">
                          Edit
                        </button>
                        <button className="text-sm text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
