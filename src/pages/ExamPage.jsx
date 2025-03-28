import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const ExamPage = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const { examId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("exams")
          .select("*")
          .eq("id", examId);
        if (error) throw error;
        setExams(data || []);
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    };

    //find classname from classroom id from supabase class
    const findClassName = async (classroomId) => {
      try {
        const { data, error } = await supabase
          .from("classrooms")
          .select("classname")
          .eq("id", classroomId);
        if (error) throw error;
        return data[0].classname;
      } catch (error) {
        console.error("Error fetching classroom:", error);
      }
    };
    fetchExams();
    findClassName();
  }, [examId]);

  const handleViewSeatingArrangement = (classroomId) => {
    navigate(`/seating-arrangement/${classroomId}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Exam Details</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg">No exam details available.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  {exam.subject}
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-blue-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      ></path>
                    </svg>
                    <p className="text-gray-700">
                      Classroom:{" "}
                      <span className="font-medium">{exam.classroom_id}</span>
                    </p>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-blue-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <p className="text-gray-700">
                      Date:{" "}
                      <span className="font-medium">
                        {new Date(exam.date).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-blue-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <p className="text-gray-700">
                      Time: <span className="font-medium">{exam.time}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() =>
                      handleViewSeatingArrangement(exam.classroom_id)
                    }
                    className="w-full md:w-auto text-sm bg-blue-600 rounded-lg text-white px-5 py-2.5 hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      ></path>
                    </svg>
                    View Seating Arrangement
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamPage;
