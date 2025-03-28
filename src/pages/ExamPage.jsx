import { useState, useEffect } from "react";
import supabase from "../services/supabase";

const ExamPage = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getExams = async () => {
      try {
        const { data, error } = await supabase
          .from("exams")
          .select("*")
          .order("date", { ascending: true });

        if (error) throw error;

        console.log("Fetched exams:", data);
        setExams(data || []);
      } catch (err) {
        setError("Failed to fetch exams");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getExams();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Exams</h1>

      {exams.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
          <p className="text-gray-600">No exams found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-5">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {exam.subject || "Untitled Exam"}
                </h2>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500">
                    Subject Code:{" "}
                    <span className="text-gray-700">
                      {exam.subject_code || "Not assigned"}
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <p className="text-gray-500">
                    Branch:{" "}
                    <span className="font-medium text-gray-700">
                      {exam.branch || "Not assigned"}
                    </span>
                  </p>
                  <p className="text-gray-500">
                    Year:{" "}
                    <span className="font-medium text-gray-700">
                      {exam.year || "Not assigned"}
                    </span>
                  </p>
                  <p className="text-gray-500">
                    Semester:{" "}
                    <span className="font-medium text-gray-700">
                      {exam.sem || "Not assigned"}
                    </span>
                  </p>
                  <p className="text-gray-500">
                    Classroom:{" "}
                    <span className="font-medium text-gray-700">
                      {exam.classroom_id || "Not assigned"}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col gap-1 text-sm text-gray-500 mb-4">
                  <p>
                    Date:{" "}
                    <span className="font-medium text-gray-700">
                      {exam.date
                        ? new Date(exam.date).toLocaleDateString()
                        : "Not scheduled"}
                    </span>
                  </p>
                  <p>
                    Time:{" "}
                    <span className="font-medium text-gray-700">
                      {exam.start_time
                        ? `${exam.start_time} - ${exam.end_time || "N/A"}`
                        : "Not scheduled"}
                    </span>
                  </p>
                  <p>
                    Duration:{" "}
                    <span className="font-medium text-gray-700">
                      {exam.start_time && exam.end_time
                        ? calculateDuration(exam.start_time, exam.end_time)
                        : "N/A"}
                    </span>
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                  <button className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors mr-2">
                    Details
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to calculate duration from start and end times
const calculateDuration = (startTime, endTime) => {
  try {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    let durationMinutes =
      endHour * 60 + endMinute - (startHour * 60 + startMinute);
    if (durationMinutes < 0) durationMinutes += 24 * 60; // Handle case when end time is next day

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    return hours > 0
      ? `${hours}h ${minutes > 0 ? minutes + "m" : ""}`
      : `${minutes}m`;
  } catch (err) {
    return "N/A";
  }
};

export default ExamPage;
