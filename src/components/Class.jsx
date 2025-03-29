import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this import for navigation
import supabase from "../services/supabase";
import useVerifyUser from "../services/useVerifyUser";

const Classroom = ({ allocatedSeats = null, classroomId }) => {
  const [seatingData, setSeatingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSeatingConfig, setHasSeatingConfig] = useState(false); // New state for tracking configuration status
  const [className, setClassName] = useState("Classroom"); // State for classroom name
  const role = useVerifyUser(); // Use the verification hook instead of direct localStorage access
  const totalBenches = 18; // As defined in generateSeatingArr.js
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch classroom name first
        const { data: classroomData, error: classroomError } = await supabase
          .from("classrooms")
          .select("classname")
          .eq("id", classroomId)
          .single();

        if (classroomError) {
          console.error("Error fetching classroom data:", classroomError);
        } else if (classroomData) {
          setClassName(classroomData.name);
        }

        // Then fetch seating data
        const { data, error } = await supabase
          .from("classroom_seating")
          .select("seating_data")
          .eq("classroom_id", classroomId);

        if (error) {
          console.error("Error fetching seating data:", error);
          return;
        }

        // Set hasSeatingConfig based on whether data exists
        setHasSeatingConfig(data && data.length > 0);

        if (data && data.length > 0) {
          // Extract the actual seating data from the response structure
          const actualSeatingData = data[0].seating_data;
          setSeatingData(actualSeatingData);
          console.log("Seating data fetched successfully:", actualSeatingData);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    // If allocatedSeats is provided, use it; otherwise fetch default data
    if (allocatedSeats) {
      // Check if allocatedSeats has the nested structure and handle accordingly
      if (allocatedSeats.length > 0 && allocatedSeats[0].seating_data) {
        setSeatingData(allocatedSeats[0].seating_data);
      } else {
        setSeatingData(allocatedSeats);
      }
      setLoading(false);
    } else {
      fetchData();
    }
  }, [allocatedSeats, classroomId]);

  // Helper function to determine branch color - optimized version
  const getBranchColor = (student) => {
    if (!student) return "bg-gray-50";

    // Get unique branches only once and memoize them
    const branchColors = {
      CSE: "bg-blue-100",
      ECE: "bg-green-100",
      EEE: "bg-yellow-100",
      MECH: "bg-purple-100",
      CIVIL: "bg-pink-100",
      IT: "bg-orange-100",
    };

    return branchColors[student.branch] || "bg-gray-100";
  };

  // Create array of student benches
  const renderBenches = () => {
    return Array.from({ length: totalBenches }, (_, index) => {
      // Get students assigned to this bench if available
      const benchData =
        seatingData && seatingData.find((seat) => seat.bench_row === index + 1);
      const leftStudent = benchData?.left_student || null;
      const rightStudent = benchData?.right_student || null;

      // Calculate different colors based on branch
      const leftBgColor = getBranchColor(leftStudent);
      const rightBgColor = getBranchColor(rightStudent);

      return (
        <div
          key={index}
          className="relative bg-white border-2 border-gray-300 rounded-lg shadow-md mb-4 h-24 overflow-hidden transition-all hover:shadow-lg hover:scale-[1.01] hover:border-gray-400"
        >
          {/* Bench number indicator */}
          <div className="absolute top-0 left-0 bg-gray-700 text-white text-xs px-2 py-1 rounded-br-md z-10">
            {index + 1}
          </div>

          {/* Two student positions */}
          <div className="flex h-full">
            {/* Left student */}
            <div
              className={`w-1/2 h-full flex items-center justify-center p-2 border-r border-gray-300 ${leftBgColor}`}
            >
              {leftStudent ? (
                <div className="text-center p-2 rounded-md w-full">
                  <div className="font-bold text-sm truncate">
                    {leftStudent.university_no}
                  </div>
                  <div className="text-xs text-gray-600 truncate max-w-[90px] mt-1 bg-white rounded-full px-2 py-0.5 border border-gray-200 inline-block">
                    {leftStudent.branch}
                  </div>
                </div>
              ) : (
                <span className="text-gray-400 text-sm">Empty Seat</span>
              )}
            </div>

            {/* Right student */}
            <div
              className={`w-1/2 h-full flex items-center justify-center p-2 ${rightBgColor}`}
            >
              {rightStudent ? (
                <div className="text-center p-2 rounded-md w-full">
                  <div className="font-bold text-sm truncate">
                    {rightStudent.university_no}
                  </div>
                  <div className="text-xs text-gray-600 truncate max-w-[90px] mt-1 bg-white rounded-full px-2 py-0.5 border border-gray-200 inline-block">
                    {rightStudent.branch}
                  </div>
                </div>
              ) : (
                <span className="text-gray-400 text-sm">Empty Seat</span>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  const arrange = () => {
    navigate(`/classrooms/arrange-seats/${classroomId}`);
  };

  // Generate branch legend
  const renderBranchLegend = () => {
    if (!seatingData || seatingData.length === 0) return null;

    // Get unique branches
    const uniqueBranches = new Set();
    seatingData.forEach((seat) => {
      if (seat.left_student) uniqueBranches.add(seat.left_student.branch);
      if (seat.right_student) uniqueBranches.add(seat.right_student.branch);
    });

    const branchColors = [
      { branch: [...uniqueBranches][0], color: "blue" },
      { branch: [...uniqueBranches][1], color: "green" },
      { branch: [...uniqueBranches][2], color: "yellow" },
      { branch: [...uniqueBranches][3], color: "purple" },
      { branch: [...uniqueBranches][4], color: "pink" },
      { branch: [...uniqueBranches][5], color: "orange" },
    ].filter((item, index) => index < uniqueBranches.size);

    return (
      <div className="flex justify-center mb-4 gap-4 flex-wrap">
        {branchColors.map((item, index) => (
          <div key={index} className="flex items-center">
            <span
              className={`w-4 h-4 bg-${item.color}-100 border border-${item.color}-200 rounded-sm inline-block mr-1`}
            ></span>
            <span className="text-sm text-gray-600">{item.branch}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {className} Seating Arrangement
        </h2>
        {/* Indicator for seating configuration status */}
        {hasSeatingConfig && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-green-200 flex items-center">
            <svg
              className="w-3 h-3 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              ></path>
            </svg>
            Configured
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 flex flex-col items-center">
          <p>Loading seating arrangement...</p>
        </div>
      ) : (
        <>
          {renderBranchLegend()}

          {seatingData.length === 0 && (
            <div className="mt-6 text-center text-sm bg-amber-50 text-amber-700 p-4 rounded-md border border-amber-200">
              No students available to allocate seats for this exam
              {role === "admin" && (
                <button
                  onClick={arrange}
                  className="bg-black ml-8 rounded-md text-white p-2 mb-4 hover:bg-gray-800 transition-colors"
                >
                  Arrange Seats
                </button>
              )}
            </div>
          )}

          {/* Teacher's desk at the front */}
          <div className="w-full flex justify-center mb-8">
            <div className="bg-indigo-100 border-2 border-indigo-300 rounded-lg w-1/3 h-16 flex items-center justify-center shadow-md">
              <span className="font-medium text-indigo-800">
                Teacher's Desk
              </span>
            </div>
          </div>

          {/* Main classroom area with benches */}
          <div className="px-8 py-6 bg-gray-100 rounded-lg border border-gray-200 shadow-inner">
            <div className="mb-3 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Total benches: {totalBenches}
              </span>

              {/* Only show delete seating arrangement button for admin users */}
              {role === "admin" && seatingData.length > 0 && (
                <button
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this seating arrangement?"
                      )
                    ) {
                      try {
                        const { error } = await supabase
                          .from("classroom_seating")
                          .delete()
                          .eq("classroom_id", classroomId);

                        if (error) throw error;

                        // Clear the seating data in state
                        setSeatingData([]);
                        setHasSeatingConfig(false);
                      } catch (err) {
                        console.error(
                          "Error deleting seating arrangement:",
                          err
                        );
                        alert("Failed to delete seating arrangement");
                      }
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded-md"
                >
                  Delete Arrangement
                </button>
              )}
            </div>

            {/* Benches in 3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderBenches()}
            </div>
          </div>

          {/* Show arrange button at the bottom as well if no seating arrangement */}
          {seatingData.length === 0 && role === "admin" && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={arrange}
                className="bg-black rounded-md text-white px-4 py-2 hover:bg-gray-800 transition-colors"
              >
                Arrange Seats
              </button>
            </div>
          )}

          {/* Show re-arrange button if seating arrangement exists */}
          {seatingData.length > 0 && role === "admin" && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={arrange}
                className="bg-gray-800 rounded-md text-white px-4 py-2 hover:bg-gray-700 transition-colors"
              >
                Re-arrange Seats
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Classroom;
