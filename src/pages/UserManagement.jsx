import React, { useState, useEffect } from "react";
import { adminService } from "../services/api";
import Sidebar from "../components/Sidebar";
import { Edit, Trash2, Plus } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "",
    year: "",
    section: "",
    rollno: "",
  });
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(`Failed to fetch users: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminService.deleteUser(userId);
        setUsers(users.filter((user) => user.id !== userId));
      } catch (err) {
        setError(`Failed to delete user: ${err.message}`);
        console.error(err);
      }
    }
  };

  const openAddModal = () => {
    setCurrentUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "student",
      department: "",
      year: "",
      section: "",
      rollno: "",
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "", // Don't pre-fill password for security
      role: user.role || "student",
      department: user.department || "",
      year: user.year || "",
      section: user.section || "",
      rollno: user.rollno || "",
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (currentUser) {
        // Update existing user
        const updatedUser = { ...formData };
        // Only include password if it was entered
        if (!updatedUser.password) delete updatedUser.password;

        await adminService.updateUser(currentUser.id, updatedUser);
      } else {
        // Create new user
        await adminService.addUser(formData);
      }

      // Refresh user list
      fetchUsers();
      setShowModal(false);
    } catch (err) {
      setError(
        `Failed to ${currentUser ? "update" : "add"} user: ${err.message}`
      );
      console.error(err);
    }
  };

  const filteredUsers =
    filter === "all" ? users : users.filter((user) => user.role === filter);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-zinc-50">
        <h1 className="text-3xl font-bold text-zinc-900 mb-6">
          User Management
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-zinc-100 border border-red-300 text-zinc-900 rounded-md flex justify-between items-center">
            {error}
            <button
              onClick={() => setError(null)}
              className="text-zinc-500 hover:text-zinc-800"
            >
              ✕
            </button>
          </div>
        )}

        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-zinc-700">Filter by role:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-zinc-300 rounded-md px-3 py-1 bg-transparent focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:border-zinc-800 text-sm"
            >
              <option value="all">All Users</option>
              <option value="student">Students</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-zinc-800 transition-colors"
          >
            <Plus size={16} /> Add New User
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-zinc-600">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10 bg-zinc-100 rounded-md text-zinc-600 border border-zinc-200">
            No users found for the selected filter.
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-md overflow-hidden border border-zinc-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Department
                    </th>
                    {filter === "student" || filter === "all" ? (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Section
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Roll No
                        </th>
                      </>
                    ) : null}
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-zinc-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium 
                          ${
                            user.role === "admin"
                              ? "bg-zinc-200 text-zinc-800"
                              : user.role === "faculty"
                              ? "bg-zinc-100 text-zinc-700"
                              : "bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                        {user.department || "-"}
                      </td>
                      {filter === "student" || filter === "all" ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                            {user.year || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                            {user.section || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                            {user.rollno || "-"}
                          </td>
                        </>
                      ) : null}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-zinc-600 hover:text-zinc-900 transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-zinc-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal for Add/Edit User */}
        {showModal && (
          <div className="fixed inset-0 bg-zinc-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg border border-zinc-200 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-zinc-900">
                  {currentUser ? "Edit User" : "Add New User"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-zinc-500 hover:text-zinc-800"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-zinc-700 text-sm font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:border-zinc-800"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-zinc-700 text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:border-zinc-800"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-zinc-700 text-sm font-medium mb-2">
                    Password {currentUser && "(leave blank to keep current)"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:border-zinc-800"
                    required={!currentUser}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-zinc-700 text-sm font-medium mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:border-zinc-800 bg-white"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-zinc-700 text-sm font-medium mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:border-zinc-800"
                  />
                </div>

                {formData.role === "student" && (
                  <>
                    <div className="mb-4">
                      <label className="block text-zinc-700 text-sm font-medium mb-2">
                        Year
                      </label>
                      <input
                        type="text"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:border-zinc-800"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-zinc-700 text-sm font-medium mb-2">
                        Section
                      </label>
                      <input
                        type="text"
                        name="section"
                        value={formData.section}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:border-zinc-800"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-zinc-700 text-sm font-medium mb-2">
                        Roll Number
                      </label>
                      <input
                        type="text"
                        name="rollno"
                        value={formData.rollno}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:border-zinc-800"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-zinc-800 bg-zinc-200 rounded-md hover:bg-zinc-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors"
                  >
                    {currentUser ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
