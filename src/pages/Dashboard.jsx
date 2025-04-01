import React, { useEffect, useState } from "react";
import supabase from "../services/supabase";

const Dashboard = () => {
  // State management
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState(["All"]);
  
  // User information
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userBranch, setUserBranch] = useState(null);
  
  // Filters
  const [branchFilter, setBranchFilter] = useState("All");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser?.id) return;

        const currentUserId = storedUser.id;
        setUserId(currentUserId);

        // Fetch user details
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", currentUserId)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError);
        } else {
          setUserRole(userData?.role);
          setUserBranch(userData?.branch);
        }
      } catch (error) {
        console.error("Error in fetchUserData:", error);
      }
    };

    fetchUserData();
  }, []);

  // Fetch students and exams data
  useEffect(() => {
    const fetchStudentsAndExams = async () => {
      try {
        // Fetch students data
        const { data: studentsData, error: studentsError } = await supabase
          .from("students")
          .select("*");

        if (studentsError) throw studentsError;
        setStudents(studentsData || []);

        // Get exam IDs from students data
        const examIds = studentsData
          .filter(student => student.exam_id)
          .map(student => student.exam_id);

        // Fetch exams if we have IDs
        if (examIds.length > 0) {
          const { data: examsData, error: examsError } = await supabase
            .from("exams")
            .select("*")
            .in("id", examIds);

          if (examsError) throw examsError;
          setExams(examsData || []);
          setFilteredExams(examsData || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndExams();
  }, []);

  // Extract unique branches for filter dropdown
  useEffect(() => {
    if (exams.length > 0) {
      const uniqueBranches = ["All", ...new Set(exams.map(exam => exam.branch))];
      setBranches(uniqueBranches);
    }
  }, [exams]);

  // Apply filters when criteria change
  useEffect(() => {
    if (exams.length === 0) {
      setFilteredExams([]);
      return;
    }

    let filtered = [...exams];

    // Branch filter
    if (branchFilter !== "All") {
      filtered = filtered.filter(exam => exam.branch === branchFilter);
    }

    // Date filters
    if (fromDateFilter) {
      const fromDate = new Date(fromDateFilter);
      filtered = filtered.filter(exam => new Date(exam.date) >= fromDate);
    }

    if (toDateFilter) {
      const toDate = new Date(toDateFilter);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(exam => new Date(exam.date) <= toDate);
    }

    // Student-specific filtering
    if (userRole === "student" && userId) {
      const studentExamIds = students
        .filter(student => student.id === userId)
        .map(student => student.exam_id);

      filtered = filtered.filter(exam => studentExamIds.includes(exam.id));
    }

    setFilteredExams(filtered);
  }, [exams, branchFilter, fromDateFilter, toDateFilter, userRole, userId, students]);

  // Reset all filters
  const clearFilters = () => {
    setBranchFilter("All");
    setFromDateFilter("");
    setToDateFilter("");
  };

  // Render exam card
  const renderExamCard = (exam) => (
    <div key={exam.id} className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-xl font-semibold text-gray-800">{exam.subject}</h2>
        {userRole === "student" && (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Allocated
          </span>
        )}
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Code</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year/Sem</th>
            {userRole === "student" && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredExams.map(exam => (
            <tr key={exam.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.subject}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{exam.subject_code}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(exam.date).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{exam.start_time} - {exam.end_time}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{exam.classroom_id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{exam.branch}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{exam.year} Year, {exam.sem} Semester</td>
              {userRole === "student" && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Allocated</span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render filter section
  const renderFilters = () => (
    <div className="mb-6 bg-white p-4 rounded-lg shadow flex gap-4">
      {userRole !== "student" && (
        <div className="flex flex-col">
          <label htmlFor="branchFilter" className="text-sm text-gray-600 mb-1">
            Filter by Branch:
          </label>
          <select
            id="branchFilter"
            value={branchFilter}
            onChange={e => setBranchFilter(e.target.value)}
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {branches.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col">
        <label htmlFor="fromDateFilter" className="text-sm text-gray-600 mb-1">
          From Date:
        </label>
        <input
          type="date"
          id="fromDateFilter"
          value={fromDateFilter}
          onChange={e => setFromDateFilter(e.target.value)}
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
          onChange={e => setToDateFilter(e.target.value)}
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

  // Display empty state message
  const renderEmptyState = () => (
    <div className="text-center py-10 text-gray-500">
      {exams.length === 0
        ? userRole === "student"
          ? "No exams allocated to you"
          : "No exams scheduled"
        : "No exams match your filters"}
    </div>
  );

  return (
    <div className="bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {loading ? (
        <div className="text-gray-600">Loading exams...</div>
      ) : (
        <>
          {renderFilters()}

          <div>
            <h1 className="text-2xl font-semibold mb-4 text-gray-800">
              {userRole === "student" ? "My Allocated Exams" : "All Exams"}
            </h1>
            
            {filteredExams.length > 0 ? (
              <>
                {renderExamTable()}
                
                <p className="mb-6 text-gray-600">
                  Showing {filteredExams.length} of {exams.length} {userRole === "student" ? "allocated" : "scheduled"} exams
                  {branchFilter !== "All" && ` for ${branchFilter} branch`}
                  {fromDateFilter && ` from ${new Date(fromDateFilter).toLocaleDateString()}`}
                  {toDateFilter && ` to ${new Date(toDateFilter).toLocaleDateString()}`}
                </p>

                <div className="grid grid-cols-3 gap-6">
                  {filteredExams.map(renderExamCard)}
                </div>
              </>
            ) : (
              <div className="text-center py-6 bg-white shadow-md rounded-lg mb-8">
                <p className="text-gray-500">
                  {userRole === "student" ? "No exams allocated to you yet." : "No exams scheduled yet."}
                </p>
              </div>
            )}

            {filteredExams.length === 0 && renderEmptyState()}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;