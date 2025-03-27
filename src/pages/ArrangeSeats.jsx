import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { adminService } from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import generateSeatingArrangement from "../services/generateSeatingArr";
import StgAgmnt from "../components/Class";
import supabase from "../lib/supabase";

const ArrangeSeats = () => {
  // Fix parameter name to match route parameter in App.jsx
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [loading, setLoading] = useState(true);
  const [arranging, setArranging] = useState(false);
  const [seatingStatus, setSeatingStatus] = useState(null);
  const [branch1, setBranch1] = useState("");
  const [branch2, setBranch2] = useState("");
  const [branches, setBranches] = useState([]);
  const [branchError, setBranchError] = useState(false);
  const [allocatedSeats, setAllocatedSeats] = useState(null);
  const [branchNames, setBranchNames] = useState({});

  useEffect(() => {
    fetchData();
  }, [classroomId]); // Update dependency

  useEffect(() => {
    // Reset branch error when selections change
    if (branch1 && branch2 && branch1 === branch2) {
      setBranchError(true);
    } else {
      setBranchError(false);
    }
  }, [branch1, branch2]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Get the specific classroom
      const classroomData = await adminService.getClassroomById(classroomId);
      setClassroom(classroomData);

      // Get exams that don't have a classroom assigned
      const examsData = await adminService.getAllExams();
      const availableExams = examsData.filter((exam) => !exam.classroom_id);
      setExams(availableExams);

      // Get branches for selection
      const branchesData = await adminService.getAllBranches();
      setBranches(branchesData || []);

      // Create a mapping of branch IDs to names for easier reference
      const branchMapping = {};
      branchesData.forEach((branch) => {
        branchMapping[branch.id] = branch.name;
      });
      setBranchNames(branchMapping);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeatingArrangement = async (examId) => {
    try {
      // Get the seating arrangement for this exam and classroom
      const { data, error } = await supabase
        .from("seating_arrangement")
        .select("*")
        .eq("exam_id", examId)
        .eq("classroom_id", classroomId);

      if (error) throw error;

      if (data && data.length > 0) {
        // For each seat, get the student data
        const seatsWithStudents = await Promise.all(
          data.map(async (seat) => {
            // Get left student data
            let leftStudent = null;
            if (seat.left) {
              const { data: leftData } = await supabase
                .from("users")
                .select("*")
                .eq("id", seat.left)
                .single();

              if (leftData) {
                leftStudent = {
                  ...leftData,
                  branch_name: branchNames[leftData.branch] || "Unknown",
                };
              }
            }

            // Get right student data
            let rightStudent = null;
            if (seat.right) {
              const { data: rightData } = await supabase
                .from("users")
                .select("*")
                .eq("id", seat.right)
                .single();

              if (rightData) {
                rightStudent = {
                  ...rightData,
                  branch_name: branchNames[rightData.branch] || "Unknown",
                };
              }
            }

            return {
              ...seat,
              left_student: leftStudent,
              right_student: rightStudent,
            };
          })
        );

        setAllocatedSeats(seatsWithStudents);
      }
    } catch (error) {
      console.error("Error fetching seating arrangement:", error);
    }
  };

  const handleArrangeSeats = async () => {
    if (!selectedExam) {
      alert("Please select an exam");
      return;
    }

    if (!branch1 || !branch2) {
      alert("Please select both branches");
      return;
    }

    if (branch1 === branch2) {
      alert("Branch 1 and Branch 2 cannot be the same");
      return;
    }

    try {
      setArranging(true);
      setSeatingStatus({ status: "processing", message: "Arranging seats..." });

      // Pass branch information as an object
      const result = await generateSeatingArrangement(
        selectedExam,
        classroomId,
        {
          branch1,
          branch2,
        }
      );

      setSeatingStatus({
        status: "success",
        message: "Seating arrangement completed successfully",
      });

      // After successful generation, fetch the seating arrangement to display
      await fetchSeatingArrangement(selectedExam);
    } catch (error) {
      console.error("Error arranging seats:", error);
      setSeatingStatus({
        status: "error",
        message: "Failed to arrange seats: " + error.message,
      });
    } finally {
      setArranging(false);
    }
  };

  const goBack = () => {
    navigate("/seating-arrangement");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700"></div>
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Classroom not found</h2>
            <button
              onClick={goBack}
              className="flex items-center text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Seating
              Arrangements
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <div className="p-8">
          <button
            onClick={goBack}
            className="flex items-center text-gray-700 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Seating visualization */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <StgAgmnt
                allocatedSeats={allocatedSeats}
                className={classroom.classname}
              />
            </div>

            {/* Right side - Controls */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
                Arrange Seats - {classroom.classname}
              </h1>

              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Capacity:</span>{" "}
                  {classroom.capacity} students
                </p>
                {classroom.location && (
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Location:</span>{" "}
                    {classroom.location}
                  </p>
                )}
                {classroom.features && (
                  <p className="text-gray-600">
                    <span className="font-medium">Features:</span>{" "}
                    {classroom.features}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6">
                <h2 className="text-lg font-medium mb-4">Select an Exam</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Choose an exam to create a seating arrangement for this
                  classroom.
                </p>

                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors mb-4"
                  disabled={arranging}
                >
                  <option value="">Select an exam</option>
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.subject} -{" "}
                      {new Date(exam.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>

                <h2 className="text-lg font-medium mt-6 mb-2">
                  Select Branches
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                  Choose two branches to alternate in the seating arrangement.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="branch1"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Branch 1
                    </label>
                    <select
                      id="branch1"
                      value={branch1}
                      onChange={(e) => setBranch1(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                        branchError ? "border-red-300" : "border-gray-300"
                      }`}
                      disabled={arranging}
                    >
                      <option value="">Select First Branch</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="branch2"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Branch 2
                    </label>
                    <select
                      id="branch2"
                      value={branch2}
                      onChange={(e) => setBranch2(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                        branchError ? "border-red-300" : "border-gray-300"
                      }`}
                      disabled={arranging}
                    >
                      <option value="">Select Second Branch</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {branchError && (
                  <p className="text-sm text-red-600 mt-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Branch 1 and Branch 2 cannot be the same
                  </p>
                )}

                {exams.length === 0 && (
                  <p className="text-sm text-amber-700 mt-2">
                    No available exams found. All exams may already have
                    classrooms assigned.
                  </p>
                )}
              </div>

              {seatingStatus && (
                <div
                  className={`p-4 rounded-md mb-6 ${
                    seatingStatus.status === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : seatingStatus.status === "error"
                      ? "bg-red-50 text-red-800 border border-red-200"
                      : "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}
                >
                  <div className="flex items-center">
                    {seatingStatus.status === "success" && (
                      <CheckCircle className="h-5 w-5 mr-2" />
                    )}
                    {seatingStatus.message}
                  </div>
                </div>
              )}

              <button
                onClick={handleArrangeSeats}
                className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm font-medium transition-colors flex items-center justify-center w-full"
                disabled={
                  !selectedExam ||
                  !branch1 ||
                  !branch2 ||
                  arranging ||
                  branchError
                }
              >
                {arranging ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Processing...
                  </>
                ) : (
                  "Generate Seating Arrangement"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArrangeSeats;
