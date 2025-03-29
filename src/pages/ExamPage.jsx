import { useState, useEffect } from "react";
import supabase from "../services/supabase";
import useVerifyUser from "../services/useVerifyUser";

const ExamPage = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invigilationStatus, setInvigilationStatus] = useState({
    message: "",
    type: "",
    examId: null,
  });
  const userRole = useVerifyUser(); // Get user role

  useEffect(() => {
    const getExams = async () => {
      try {
        // Fetch exams with invigilation and faculty data
        const { data, error } = await supabase
          .from("exams")
          .select(
            `
            *,
            invigilation:invigilation(
              *,
              faculty:faculty_id(id, name)
            )
          `
          )
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

  const handleInvigilate = async (exam) => {
    try {
      // Get user ID from localStorage
      const userData = JSON.parse(localStorage.getItem("user"));

      if (!userData || !userData.id) {
        setInvigilationStatus({
          message: "User information not found. Please log in again.",
          type: "error",
          examId: exam.id,
        });
        return;
      }

      // Check if classroom_id exists in exam data
      if (!exam.classroom_id) {
        setInvigilationStatus({
          message: "No classroom assigned to this exam.",
          type: "error",
          examId: exam.id,
        });
        return;
      }

      // Create the invigilation record with classroom_id
      const invigilation = {
        exam_id: exam.id,
        faculty_id: userData.id,
        classroom_id: exam.classroom_id,
      };

      console.log("Creating invigilation record:", invigilation);

      // Insert the invigilation record
      const { data, error } = await supabase
        .from("invigilation")
        .insert([invigilation]);

      if (error) throw error;

      // Refresh exams data to update UI with new invigilator
      const { data: updatedExams, error: refreshError } = await supabase
        .from("exams")
        .select(
          `
          *,
          invigilation:invigilation(
            *,
            faculty:faculty_id(id, name)
          )
        `
        )
        .order("date", { ascending: true });

      if (refreshError) throw refreshError;
      setExams(updatedExams || []);

      setInvigilationStatus({
        message: "You have been assigned as an invigilator for this exam.",
        type: "success",
        examId: exam.id,
      });
    } catch (err) {
      console.error("Invigilation error:", err);
      setInvigilationStatus({
        message: "Failed to register as invigilator. Please try again.",
        type: "error",
        examId: exam.id,
      });
    }
  };

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

                {/* Display invigilator information if available */}
                {exam.invigilation &&
                  exam.invigilation.length > 0 &&
                  exam.invigilation[0].faculty && (
                    <div className="mb-4 p-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded">
                      <p className="font-semibold">Invigilator:</p>
                      <p>{exam.invigilation[0].faculty.name}</p>
                    </div>
                  )}

                {invigilationStatus.examId === exam.id &&
                  invigilationStatus.message && (
                    <div
                      className={`mb-4 p-2 text-sm rounded ${
                        invigilationStatus.type === "success"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {invigilationStatus.message}
                    </div>
                  )}

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                  <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700 transition-colors mr-2">
                    Details
                  </button>
                  {userRole === "admin" && (
                    <button className="px-4 py-2 border border-gray-200 text-gray-400 rounded-md hover:bg-gray-100 transition-colors">
                      Edit
                    </button>
                  )}
                  {userRole === "faculty" && !exam.invigilation?.length && (
                    <button
                      className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700 transition-colors"
                      onClick={() => handleInvigilate(exam)}
                    >
                      Invigilate
                    </button>
                  )}
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
