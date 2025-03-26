import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { adminService } from "../services/api";

const AdminExamManagement = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllExams();
      setExams(data);
    } catch (err) {
      setError(`Failed to fetch exams: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle editing an exam
  const handleEdit = (examId) => {
    navigate(`/admin/exams/${examId}/edit`);
  };

  // Function to handle viewing seating arrangement
  const handleViewSeating = (examId) => {
    navigate(`/admin/seating/${examId}`);
  };

  // Function to format date in a readable format
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Exam Management</h1>
          <button
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            onClick={() => navigate("/admin/exams/new")}
          >
            Add New Exam
          </button>
        </div>

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

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">All Examinations</h3>
            <p className="text-sm text-gray-500">Manage all scheduled exams</p>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-center py-4">Loading exams...</div>
            ) : exams.length === 0 ? (
              <div className="text-center py-4">No exams found</div>
            ) : (
              <div className="grid gap-6">
                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xl font-medium">{exam.subject}</h4>
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${
                          exam.type === "Final"
                            ? "bg-gray-800 text-white"
                            : exam.type === "Mid-Term"
                            ? "bg-gray-600 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {exam.type}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-1">
                      <strong>Course Code:</strong> {exam.course}
                    </p>
                    <p className="text-sm text-gray-500 mb-1">
                      <strong>Date:</strong> {formatDate(exam.date)}
                    </p>
                    <p className="text-sm text-gray-500 mb-1">
                      <strong>Time:</strong> {exam.time}
                    </p>
                    <p className="text-sm text-gray-500 mb-1">
                      <strong>Venue:</strong>{" "}
                      {exam.venue || exam.classrooms?.classname || "TBD"}
                    </p>

                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => handleEdit(exam.id)}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Edit Exam
                      </button>
                      <button
                        onClick={() => handleViewSeating(exam.id)}
                        className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                      >
                        Manage Seating
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminExamManagement;
