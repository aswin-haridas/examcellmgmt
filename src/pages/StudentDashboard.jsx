import React, { useState, useEffect } from "react";
import { studentService } from "../services/api";

export const StudentDashboard = () => {
  const [date, setDate] = useState(new Date());
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const exams = await studentService.getExams();
        setUpcomingExams(exams);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch exams:", err);
        setError("Failed to load exam data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  // Function to format date in a readable format
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Student Dashboard
      </h1>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upcoming Exams */}
        <div className="md:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Upcoming Exams</h3>
              <p className="text-sm text-gray-500">
                Your scheduled examinations
              </p>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="text-center py-8">
                  <p>Loading exams data...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p>{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-blue-500 hover:underline"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingExams.length > 0 ? (
                    upcomingExams.map((exam) => (
                      <div
                        key={exam.id}
                        className="border border-gray-200 rounded-lg"
                      >
                        <div className="p-4 pb-2 border-b border-gray-100">
                          <div className="flex justify-between items-center">
                            <h4 className="text-lg font-medium">
                              {exam.subject}
                            </h4>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
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
                        </div>
                        <div className="p-4 pb-2">
                          <p className="text-sm text-gray-500">
                            <strong>Date:</strong> {formatDate(exam.date)}
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Time:</strong> {exam.time}
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Venue:</strong> {exam.venue}
                          </p>
                        </div>
                        <div className="p-4 pt-2">
                          <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p>No upcoming exams found.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
                View All Exams
              </button>
            </div>
          </div>
        </div>

        {/* Calendar and Info */}
        <div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Calendar</h3>
              <p className="text-sm text-gray-500">Your exam schedule</p>
            </div>
            <div className="p-4">
              <div className="text-center p-4 border border-gray-200 rounded-md">
                <p className="text-lg font-semibold">{date.toDateString()}</p>
                <div className="mt-2 flex justify-center">
                  <button
                    onClick={() =>
                      setDate(new Date(date.setDate(date.getDate() - 1)))
                    }
                    className="mx-1 px-2 py-1 border border-gray-300 rounded"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setDate(new Date())}
                    className="mx-1 px-2 py-1 border border-gray-300 rounded"
                  >
                    Today
                  </button>
                  <button
                    onClick={() =>
                      setDate(new Date(date.setDate(date.getDate() + 1)))
                    }
                    className="mx-1 px-2 py-1 border border-gray-300 rounded"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Quick Info</h3>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="text-center py-4">
                  <p>Loading...</p>
                </div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">
                  <p>Unable to load information</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Upcoming Exams</span>
                    <span className="font-bold">{upcomingExams.length}</span>
                  </div>
                  {upcomingExams.length > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span>Next Exam</span>
                        <span className="font-bold">
                          {upcomingExams[0].subject}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>On</span>
                        <span className="font-bold">
                          {formatDate(upcomingExams[0].date)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button className="w-full py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Academic Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
