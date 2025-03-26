import React from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

const ExamSchedulePage = () => {
  const navigate = useNavigate();

  // Function to handle navigation to seating arrangement
  const handleClick = (examId) => {
    navigate(`/seating-arrangement/${examId}`);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Exam Schedule</h1>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Upcoming Examinations</h3>
            <p className="text-sm text-gray-500">All scheduled exams</p>
          </div>

          <div className="p-4">
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
                    <strong>Venue:</strong> {exam.venue}
                  </p>

                  <div className="mt-4 flex space-x-2">
                    <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      Download Hallticket
                    </button>
                    <button
                      onClick={() => handleClick(exam.id)}
                      className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                    >
                      View Seating Arrangement
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSchedulePage;
