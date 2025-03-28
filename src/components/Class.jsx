import React, { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import { generateSeatingArr } from "../services/generateSeatingArr";

 const Classroom = ({
  allocatedSeats = null,
  className = "Classroom",
  classroomId = "0352d0dc-585a-4f55-940a-636b3dd98c42",
}) => {
  const [seatingData, setSeatingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branch1, setBranch1] = useState("");
  const [branch2, setBranch2] = useState("");
  const [branch1Exams, setBranch1Exams] = useState([]);
  const [branch2Exams, setBranch2Exams] = useState([]);
  const [examId1, setExamId1] = useState("");
  const [examId2, setExamId2] = useState("");
  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });
  const [processing, setProcessing] = useState(false);
  const totalBenches = 18; // As defined in generateSeatingArr.js
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data, error } = await supabase
          .from("branches")
          .select("code, name");
        if (error) throw error;
        setBranches(data || []);
      } catch (err) {
        console.error("Error fetching branches:", err);
      }
    };

    if (role === "admin") {
      fetchBranches();
    }
  }, [role]);

  useEffect(() => {
    const fetchDefaultSeatingData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("classroom_seating")
          .select("seating_data")
          .eq("classroom_id", classroomId);

        if (error) {
          console.error("Error fetching seating data:", error);
          return;
        }

        if (data && data.length > 0) {
          // Extract the actual seating data from the response structure
          const actualSeatingData = data[0].seating_data;
          setSeatingData(actualSeatingData);
          console.log("Seating data fetched successfully:", actualSeatingData);
        }
      } catch (err) {
        console.error("Failed to fetch seating data:", err);
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
      fetchDefaultSeatingData();
    }
  }, [allocatedSeats, classroomId]);

  // Helper function to determine branch color
  const getBranchColor = (student) => {
    if (!student) return "bg-gray-50";

    // Get unique branches in this classroom
    const uniqueBranches = new Set();
    seatingData.forEach((seat) => {
      if (seat.left_student) uniqueBranches.add(seat.left_student.branch);
      if (seat.right_student) uniqueBranches.add(seat.right_student.branch);
    });

    const branchesArray = [...uniqueBranches];

    // Assign colors based on branch index
    switch (student.branch) {
      case branchesArray[0]:
        return "bg-blue-100";
      case branchesArray[1]:
        return "bg-green-100";
      case branchesArray[2]:
        return "bg-yellow-100";
      case branchesArray[3]:
        return "bg-purple-100";
      case branchesArray[4]:
        return "bg-pink-100";
      case branchesArray[5]:
        return "bg-orange-100";
      default:
        return "bg-gray-100";
    }
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
      const leftBgColor = getBranchColor(leftStudent, benchData);
      const rightBgColor = getBranchColor(rightStudent, benchData);

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

  const arrange = async () => {
    setModal(true);
  };

  const handleArrangementSubmit = async (e) => {
    e.preventDefault();
    if (!branch1 || !branch2 || !examId1 || !examId2) {
      setStatusMessage({ type: "error", message: "Please fill all fields" });
      return;
    }

    try {
      setProcessing(true);
      setStatusMessage({ type: "", message: "" });

      const result = await generateSeatingArr(
        examId1,
        examId2,
        classroomId,
        branch1,
        branch2
      );

      if (result.success) {
        setSeatingData(result.data);
        setStatusMessage({
          type: "success",
          message: `Successfully arranged seats for ${branch1} and ${branch2}`,
        });
        setTimeout(() => setModal(false), 2000);
      }
    } catch (error) {
      console.error("Error generating seating arrangement:", error);
      setStatusMessage({
        type: "error",
        message: `Failed to generate seating: ${error.message}`,
      });
    } finally {
      setProcessing(false);
    }
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
    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
        {className} Seating Arrangement
      </h2>

      {loading ? (
        <div className="text-center py-8">
          <p>Loading seating arrangement...</p>
        </div>
      ) : (
        <>
          {renderBranchLegend()}

          {seatingData.length === 0 && (
            <div className="mt-6 text-center text-sm bg-amber-50 text-amber-700 p-4 rounded-md border border-amber-200">
              No students available to allocate seats for this exam
            </div>
          )}

          {role === "admin" && (
            <button
              onClick={arrange}
              className="bg-black rounded-md text-white p-2 mb-4 hover:bg-gray-800 transition-colors"
            >
              Arrange Seats
            </button>
          )}

          {/* Seating Arrangement Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
              <div className="bg-white p-5 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">
                    Generate Seating Arrangement
                  </h3>
                  <button
                    onClick={() => setModal(false)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    &times;
                  </button>
                </div>

                {statusMessage.type && (
                  <div
                    className={`p-3 mb-4 rounded-md ${
                      statusMessage.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {statusMessage.message}
                  </div>
                )}

                <form onSubmit={handleArrangementSubmit}>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">
                      Branch 1
                    </label>
                    <select
                      value={branch1}
                      onChange={async (e) => {
                        setBranch1(e.target.value);
                        const { data, error } = await supabase
                          .from("exams")
                          .select("id, name")
                          .eq("branch_code", e.target.value);
                        if (error) {
                          console.error("Error fetching exams:", error);
                          return;
                        }
                        setBranch1Exams(data || []);
                      }}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={`b1-${branch.code}`} value={branch.code}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">
                      Exam ID 1
                    </label>
                    <select
                      value={examId1}
                      onChange={(e) => setExamId1(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select Exam</option>
                      {branch1Exams.map((exam) => (
                        <option key={`e1-${exam.id}`} value={exam.id}>
                          {exam.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">
                      Branch 2
                    </label>
                    <select
                      value={branch2}
                      onChange={async (e) => {
                        setBranch2(e.target.value);
                        const { data, error } = await supabase
                          .from("exams")
                          .select("id, name")
                          .eq("branch_code", e.target.value);
                        if (error) {
                          console.error("Error fetching exams:", error);
                          return;
                        }
                        setBranch2Exams(data || []);
                      }}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={`b2-${branch.code}`} value={branch.code}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Exam ID 2
                    </label>
                    <select
                      value={examId2}
                      onChange={(e) => setExamId2(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select Exam</option>
                      {branch2Exams.map((exam) => (
                        <option key={`e2-${exam.id}`} value={exam.id}>
                          {exam.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setModal(false)}
                      className="mr-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                      disabled={processing}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                      disabled={processing}
                    >
                      {processing ? "Processing..." : "Generate"}
                    </button>
                  </div>
                </form>
              </div>
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
            <div className="mb-3 flex justify-end items-center">
              <span className="text-xs text-gray-500">
                Total benches: {totalBenches}
              </span>
            </div>

            {/* Benches in 3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderBenches()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};


export default Classroom