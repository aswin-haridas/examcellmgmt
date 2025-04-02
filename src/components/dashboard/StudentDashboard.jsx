import React, { useState, useEffect } from "react";
import supabase from "../../services/supabase";

const StudentDashboard = ({ userId }) => {
  // State management
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userBranch, setUserBranch] = useState(null);

  // Filters
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
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

        setUserBranch(userData?.branch);

        // Fetch student's exam allocations
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("exams")
          .eq("student_id", userId)

        if (studentError) {
          console.error("Error fetching student data:", studentError);
          setLoading(false);
          return;
        }

        // Extract exam IDs from the student data
        let examIds = [];
        if (studentData && studentData.length > 0) {
          studentData.forEach((student) => {
            if (student.exams && Array.isArray(student.exams)) {
              examIds = [...examIds, ...student.exams];
            } else if (student.exams) {
              examIds.push(student.exams);
            }
          });
        }

        console.log("Fetched exam IDs:", examIds);

        // If we have exam IDs, fetch the complete exam details
        if (examIds.length > 0) {
          const { data: examDetails, error: examError } = await supabase
            .from("exams")
            .select("*")
            .in("id", examIds);

          if (examError) {
            console.error("Error fetching exam details:", examError);
          } else {
            console.log("Fetched exam details:", examDetails);

            // Get classroom IDs from exam details
            const classroomIds = examDetails
              .map((exam) => exam.classroom_id)
              .filter((id) => id); // Filter out null/undefined classroom_ids

            // Fetch classroom data if we have classroom IDs
            if (classroomIds.length > 0) {
              const { data: classroomData, error: classroomError } =
                await supabase
                  .from("classrooms")
                  .select("id, classname")
                  .in("id", classroomIds);

              if (classroomError) {
                console.error("Error fetching classroom data:", classroomError);
              } else {
                // Create a map of classroom ids to classroom names for quick lookup
                const classroomMap = {};
                classroomData.forEach((classroom) => {
                  classroomMap[classroom.id] = classroom.classname;
                });

                // Combine exam details with classroom names
                const enrichedExamDetails = examDetails.map((exam) => ({
                  ...exam,
                  classroom_name: exam.classroom_id
                    ? classroomMap[exam.classroom_id]
                    : "Not assigned",
                }));

                setExams(enrichedExamDetails || []);
                setFilteredExams(enrichedExamDetails || []);
                setLoading(false);
                return;
              }
            }

            // If no classroom data or error, just use the exam details as is
            setExams(examDetails || []);
            setFilteredExams(examDetails || []);
            setLoading(false);
            return;
          }
        }

        // If we reached here, either there are no exams or there was an error
        setExams([]);
        setFilteredExams([]);
      } catch (error) {
        console.error("Error in student data fetching:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStudentData();
    }
  }, [userId]);

  // Apply filters when criteria change
  useEffect(() => {
    if (!Array.isArray(exams) || exams.length === 0) {
      setFilteredExams([]);
      return;
    }

    let filtered = [...exams];

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
  }, [exams, fromDateFilter, toDateFilter]);

  // Reset all filters
  const clearFilters = () => {
    setFromDateFilter("");
    setToDateFilter("");
  };

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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.isArray(filteredExams) ? (
            filteredExams.map((exam, index) => (
              <tr key={exam.id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {exam.subject}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {exam.subject_code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {exam.date ? new Date(exam.date).toLocaleDateString() : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {exam.start_time} - {exam.end_time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {exam.classroom_name || exam.classroom_id || "Not assigned"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {exam.branch}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {exam.year} Year, {exam.sem} Semester
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Allocated
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                Error: Exam data is not in correct format
              </td>
            </tr>
          )}
          {Array.isArray(filteredExams) && filteredExams.length === 0 && (
            <tr>
              <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                No exam data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // Render student filter section (only date filters for students)
  const renderFilters = () => (
    <div className="mb-6 bg-white p-4 rounded-lg shadow flex gap-4">
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

      {(fromDateFilter || toDateFilter) && (
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
    return <div className="text-gray-600">Loading student dashboard...</div>;
  }

  return (
    <>
      {renderFilters()}

      <div>
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">
          My Allocated Exams
        </h1>

        {Array.isArray(filteredExams) && filteredExams.length > 0 ? (
          <>
            {renderExamTable()}

            <p className="mb-6 text-gray-600">
              Showing {filteredExams.length} of{" "}
              {Array.isArray(exams) ? exams.length : 0} allocated exams
              {fromDateFilter &&
                ` from ${new Date(fromDateFilter).toLocaleDateString()}`}
              {toDateFilter &&
                ` to ${new Date(toDateFilter).toLocaleDateString()}`}
            </p>
          </>
        ) : (
          <div className="text-center py-6 bg-white shadow-md rounded-lg mb-8">
            <p className="text-gray-500">No exams allocated to you yet.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default StudentDashboard;
