import React, { useState, useEffect } from "react";
import supabase from "../../services/supabase";

const FacultyDashboard = ({ userId }) => {
  // State management
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userBranch, setUserBranch] = useState(null);
  const [branches, setBranches] = useState(["All"]);

  // Filters
  const [branchFilter, setBranchFilter] = useState("All");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");

  // Fetch faculty data
  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        setLoading(true);

        // Fetch user details
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError);
          setLoading(false);
          return;
        }

        const facultyBranch = userData?.branch;
        setUserBranch(facultyBranch);

        // Auto-select faculty's branch as default filter
        if (facultyBranch) {
          setBranchFilter(facultyBranch);
        }

        // Fetch exams data (possibly filtered by faculty's branch in the future)
        const { data: examsData, error: examsError } = await supabase
          .from("exams")
          .select("*");

        if (examsError) {
          console.error("Error fetching exams data:", examsError);
          setLoading(false);
          return;
        }

        setExams(examsData || []);

        // Set filtered exams based on faculty's branch
        const branchFilteredExams = facultyBranch
          ? examsData.filter((exam) => exam.branch === facultyBranch)
          : examsData;

        setFilteredExams(branchFilteredExams || []);

        // Set unique branches from fetched exams
        if (examsData?.length > 0) {
          const uniqueBranches = [
            "All",
            ...new Set(examsData.map((exam) => exam.branch)),
          ];
          setBranches(uniqueBranches);
        }
      } catch (error) {
        console.error("Error in faculty data fetching:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchFacultyData();
    }
  }, [userId]);

  // Apply filters when criteria change
  useEffect(() => {
    if (exams.length === 0) {
      setFilteredExams([]);
      return;
    }

    let filtered = [...exams];

    // Branch filter
    if (branchFilter !== "All") {
      filtered = filtered.filter((exam) => exam.branch === branchFilter);
    }

    // Date filters
    if (fromDateFilter) {
      const fromDate = new Date(fromDateFilter);
      filtered = filtered.filter((exam) => new Date(exam.date) >= fromDate);
    }

    if (toDateFilter) {
      const toDate = new Date(toDateFilter);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter((exam) => new Date(exam.date) <= toDate);
    }

    setFilteredExams(filtered);
  }, [exams, branchFilter, fromDateFilter, toDateFilter]);

  // Reset all filters
  const clearFilters = () => {
    // For faculty, reset to their branch rather than "All"
    setBranchFilter(userBranch || "All");
    setFromDateFilter("");
    setToDateFilter("");
  };

  // Render exam card
  const renderExamCard = (exam) => (
    <div
      key={exam.id}
      className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
    >
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-xl font-semibold text-gray-800">{exam.subject}</h2>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Subject Code:</span>
          <span className="font-medium text-gray-700">{exam.subject_code}</span>
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
          <span className="font-medium text-gray-700">{exam.classroom_id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Branch:</span>
          <span className="font-medium text-gray-700">{exam.branch}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Year/Sem:</span>
          <span className="font-medium text-gray-700">
            {exam.year} Year, {exam.sem} Semester
          </span>
        </div>
      </div>
    </div>
  );

  // Render exam table
  const renderExamTable = () => (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg mb-8">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Room
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Branch
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Year/Sem
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredExams.map((exam) => (
            <tr key={exam.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {exam.subject}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {exam.subject_code}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {new Date(exam.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {exam.start_time} - {exam.end_time}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {exam.classroom_id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {exam.branch}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {exam.year} Year, {exam.sem} Semester
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render faculty filter section
  const renderFilters = () => (
    <div className="mb-6 bg-white p-4 rounded-lg shadow flex gap-4">
      <div className="flex flex-col">
        <label htmlFor="branchFilter" className="text-sm text-gray-600 mb-1">
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

      <div className="flex flex-col">
        <label htmlFor="fromDateFilter" className="text-sm text-gray-600 mb-1">
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
        <label htmlFor="toDateFilter" className="text-sm text-gray-600 mb-1">
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
            onClick={clearFilters}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div className="text-gray-600">Loading faculty dashboard...</div>;
  }

  return (
    <>
      {renderFilters()}

      <div>
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">
          Department Exams
        </h1>

        {filteredExams.length > 0 ? (
          <>
            {renderExamTable()}

            <p className="mb-6 text-gray-600">
              Showing {filteredExams.length} of {exams.length} scheduled exams
              {branchFilter !== "All" && ` for ${branchFilter} branch`}
              {fromDateFilter &&
                ` from ${new Date(fromDateFilter).toLocaleDateString()}`}
              {toDateFilter &&
                ` to ${new Date(toDateFilter).toLocaleDateString()}`}
            </p>

            <div className="grid grid-cols-3 gap-6">
              {filteredExams.map(renderExamCard)}
            </div>
          </>
        ) : (
          <div className="text-center py-6 bg-white shadow-md rounded-lg mb-8">
            <p className="text-gray-500">No exams scheduled yet.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default FacultyDashboard;
