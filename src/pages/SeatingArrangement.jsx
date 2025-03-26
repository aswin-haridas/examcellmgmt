import React, { useEffect, useState } from "react";
import { ArrowRight, CheckCircle, X } from "lucide-react";
import { adminService } from "../services/api";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

const SeatingArrangement = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const classroomData = await adminService.getAllClassrooms();
      const examsData = await adminService.getAllExams();

      // Filter for available classrooms
      const availableClassrooms = classroomData.filter(
        (classroom) =>
          !examsData.some(
            (exam) =>
              exam.classroom_id === classroom.id && exam.status === "scheduled"
          )
      );

      setClassrooms(availableClassrooms);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleArrangeSeats = (classroom) => {
    // Instead of opening a modal, navigate to the arrange seats page
    navigate(`/arrange-seats/${classroom.id}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8 w-full">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Seating Arrangement
            </h1>
          </div>

          {loading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700"></div>
            </div>
          ) : (
            <>
              <div className="mb-6 p-4 bg-white border border-gray-200 rounded-md shadow-sm">
                <h2 className="text-xl font-semibold mb-4">
                  Available Classrooms
                </h2>
                <p className="text-gray-600 mb-4">
                  Select a classroom to arrange seating for an exam. Only
                  classrooms not currently assigned to scheduled exams are
                  shown.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {classrooms.length > 0 ? (
                  classrooms.map((classroom) => (
                    <div
                      key={classroom.id}
                      className="bg-white border border-gray-200 rounded-md shadow-sm p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">
                            {classroom.classname}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            Capacity: {classroom.capacity}
                          </p>
                          {classroom.location && (
                            <p className="text-gray-600 text-sm">
                              Location: {classroom.location}
                            </p>
                          )}
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                          Available
                        </span>
                      </div>

                      {classroom.features && (
                        <div className="mt-3 text-sm text-gray-600">
                          <p className="font-medium">Features:</p>
                          <p>{classroom.features}</p>
                        </div>
                      )}

                      <button
                        onClick={() => handleArrangeSeats(classroom)}
                        className="mt-4 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors w-full justify-center"
                      >
                        Arrange Seats <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-gray-200 rounded-md shadow-sm p-6 col-span-full">
                    <p className="text-center text-gray-600">
                      No available classrooms found. All classrooms may be
                      currently in use.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
          {/* Removed the modal code since we're navigating to a separate page now */}
        </div>
      </div>
    </div>
  );
};

export default SeatingArrangement;
