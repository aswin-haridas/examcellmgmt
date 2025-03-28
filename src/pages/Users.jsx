import React, { useState, useEffect } from "react";
import supabase from "../services/supabase";
import whoIsThis from "../services/useVerifyUser";
import updateUserDetails from "../services/updateUser";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    branch: "",
    university_no: "",
    year: "",
    sem: "",
  });
  const [updateMessage, setUpdateMessage] = useState("");

  const [filters, setFilters] = useState({
    role: "",
    branch: "",
    year: "",
  });
  const [uniqueBranches, setUniqueBranches] = useState([]);
  const [uniqueYears, setUniqueYears] = useState([]);

  const role = whoIsThis();

  const normalizeValue = (value) => {
    if (value === null || value === undefined) return "";
    return String(value).toLowerCase().trim();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      const branches = [
        ...new Set(
          users.map((user) => normalizeValue(user.branch)).filter(Boolean)
        ),
      ];
      const years = [
        ...new Set(
          users.map((user) => normalizeValue(user.year)).filter(Boolean)
        ),
      ].sort();

      setUniqueBranches(branches);
      setUniqueYears(years);
    }
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("users").select("*");

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users data");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
      password: "",
      branch: user.branch || "",
      university_no: user.university_no || "",
      year: user.year || "",
      sem: user.sem || "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingUser) return;

    try {
      setLoading(true);
      setUpdateMessage("");

      const { success, data, error } = await updateUserDetails(
        editingUser.id,
        formData
      );

      if (success) {
        setUsers(
          users.map((user) =>
            user.id === editingUser.id ? { ...user, ...formData } : user
          )
        );
        setUpdateMessage("User updated successfully!");
        setTimeout(() => setEditingUser(null), 1500);
      } else {
        setUpdateMessage(`Failed to update user: ${error}`);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setUpdateMessage("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const resetFilters = () => {
    setFilters({
      role: "",
      branch: "",
      year: "",
    });
  };

  const filteredUsers = users.filter((user) => {
    return (
      (filters.role === "" ||
        normalizeValue(user.role) === normalizeValue(filters.role)) &&
      (filters.branch === "" ||
        normalizeValue(user.branch) === normalizeValue(filters.branch)) &&
      (filters.year === "" ||
        normalizeValue(user.year) === normalizeValue(filters.year))
    );
  });

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white p-5 rounded-lg shadow-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  if (role !== "admin") {
    return (
      <div className="text-center text-gray-600">
        You do not have permission to access this page.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 ">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Users Management
      </h1>

      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="role-filter"
              className="block text-sm font-medium text-gray-700"
            >
              Role:
            </label>
            <select
              id="role-filter"
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="branch-filter"
              className="block text-sm font-medium text-gray-700"
            >
              Branch:
            </label>
            <select
              id="branch-filter"
              name="branch"
              value={filters.branch}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            >
              <option value="">All Branches</option>
              {uniqueBranches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="year-filter"
              className="block text-sm font-medium text-gray-700"
            >
              Year:
            </label>
            <select
              id="year-filter"
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            >
              <option value="">All Years</option>
              {uniqueYears.map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-md transition duration-200 ease-in-out"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {filteredUsers.length === 0 ? (
          <p className="p-6 text-gray-600 text-center">
            No users found matching your filters
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Univ. No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          user.role === "admin"
                            ? "bg-gray-800 text-white"
                            : user.role === "faculty"
                            ? "bg-gray-200 text-gray-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {user.branch || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {user.university_no || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {user.year || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {user.sem || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800">
                Edit User
              </h2>
            </div>

            {updateMessage && (
              <div
                className={`p-4 mx-6 mt-4 rounded-md ${
                  updateMessage.includes("success")
                    ? "bg-gray-100 text-gray-800 border border-gray-300"
                    : "bg-red-50 text-red-800 border border-red-300"
                }`}
              >
                {updateMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name:
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email:
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password:
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Leave empty to keep current password"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                  <span className="text-xs text-gray-500">
                    Leave blank to keep current password
                  </span>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Role:
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  >
                    <option value="">Select role</option>
                    <option value="admin">Admin</option>
                    <option value="faculty">Faculty</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="branch"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Branch:
                  </label>
                  <input
                    type="text"
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="university_no"
                    className="block text-sm font-medium text-gray-700"
                  >
                    University Number:
                  </label>
                  <input
                    type="text"
                    id="university_no"
                    name="university_no"
                    value={formData.university_no}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="year"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Year:
                  </label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  >
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="sem"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Semester:
                  </label>
                  <select
                    id="sem"
                    name="sem"
                    value={formData.sem}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  >
                    <option value="">Select semester</option>
                    <option value="1">1st Semester</option>
                    <option value="2">2nd Semester</option>
                    <option value="3">3rd Semester</option>
                    <option value="4">4th Semester</option>
                    <option value="5">5th Semester</option>
                    <option value="6">6th Semester</option>
                    <option value="7">7th Semester</option>
                    <option value="8">8th Semester</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
