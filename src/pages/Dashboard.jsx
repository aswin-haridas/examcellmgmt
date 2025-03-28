import React, { useEffect, useState } from "react";
import supabase from "../services/supabase";

const Dashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branchFilter, setBranchFilter] = useState("All");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");
  const [branches, setBranches] = useState(["All"]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userBranch, setUserBranch] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUserRole(userData.role);

        if (userData.role === "student") {
          setUserBranch(userData.branch);
          setBranchFilter(userData.branch);
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        let query = supabase.from("exams").select("*");

        // If user is a student, only fetch exams for their branch
        if (userRole === "student" && userBranch) {
          query = query.eq("branch", userBranch);
        }

        const { data, error } = await query;
        if (error) throw error;
        setExams(data || []);

        // Only show branch filter options for admin/faculty
        if (userRole !== "student") {
          const uniqueBranches = [...new Set(data.map((exam) => exam.branch))];
          setBranches(["All", ...uniqueBranches]);
        }
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [userRole, userBranch]);

  useEffect(() => {
    let filtered = [...exams];

    if (branchFilter !== "All") {
      filtered = filtered.filter((exam) => exam.branch === branchFilter);
    }

    if (fromDateFilter) {
      const fromDate = new Date(fromDateFilter);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((exam) => new Date(exam.date) >= fromDate);
    }

    if (toDateFilter) {
      const toDate = new Date(toDateFilter);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((exam) => new Date(exam.date) <= toDate);
    }

    setFilteredExams(filtered);
  }, [exams, branchFilter, fromDateFilter, toDateFilter]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {loading ? (
          <div className="text-gray-600">Loading exams...</div>
        ) : (
          <>
            <div className="mb-6 bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4">
              {/* Only show branch filter for admin/faculty */}
              {userRole !== "student" && (
                <div className="flex flex-col">
                  <label
                    htmlFor="branchFilter"
                    className="text-sm text-gray-600 mb-1"
                  >
                    Filter by Branch:
                  </label>
                  <select
                    id="branchFilter"
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {branches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col">
                <label
                  htmlFor="fromDateFilter"
                  className="text-sm text-gray-600 mb-1"
                >
                  From Date:
                </label>
                <input
                  type="date"
                  id="fromDateFilter"
                  value={fromDateFilter}
                  onChange={(e) => setFromDateFilter(e.target.value)}
                  className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="toDateFilter"
                  className="text-sm text-gray-600 mb-1"
                >
                  To Date:
                </label>
                <input
                  type="date"
                  id="toDateFilter"
                  value={toDateFilter}
                  onChange={(e) => setToDateFilter(e.target.value)}
                  className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {(branchFilter !== "All" || fromDateFilter || toDateFilter) && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setBranchFilter("All");
                      setFromDateFilter("");
                      setToDateFilter("");
                    }}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            <p className="mb-6 text-gray-600">
              Showing {filteredExams.length} of {exams.length} scheduled exams
              {branchFilter !== "All" && ` for ${branchFilter} branch`}
              {fromDateFilter &&
                ` from ${new Date(fromDateFilter).toLocaleDateString()}`}
              {toDateFilter &&
                ` to ${new Date(toDateFilter).toLocaleDateString()}`}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">
                    {exam.subject}
                  </h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subject Code:</span>
                      <span className="font-medium text-gray-700">
                        {exam.subject_code}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span className="font-medium text-gray-700">
                        {new Date(exam.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time:</span>
                      <span className="font-medium text-gray-700">
                        {exam.start_time} - {exam.end_time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Room:</span>
                      <span className="font-medium text-gray-700">
                        {exam.classroom_id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Branch:</span>
                      <span className="font-medium text-gray-700">
                        {exam.branch}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Year/Sem:</span>
                      <span className="font-medium text-gray-700">
                        {exam.year} Year, {exam.sem} Semester
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredExams.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                {exams.length === 0
                  ? "No exams scheduled"
                  : "No exams match your filters"}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
