import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import supabase from "../services/supabase";
import { generateSeatingArr } from "../services/generateSeatingArr";
import SeatingArrangement from "./seatingArrangement";

const SeatingGenForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // Correctly extract the ID parameter from URL
  const [classrooms, setClassrooms] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branch1, setBranch1] = useState("");
  const [branch2, setBranch2] = useState("");
  const [branch1Exams, setBranch1Exams] = useState([]);
  const [branch2Exams, setBranch2Exams] = useState([]);
  const [examId1, setExamId1] = useState("");
  const [examId2, setExamId2] = useState("");
  const [classroomId, setClassroomId] = useState(id); // Use the extracted ID
  const [classroomName, setClassroomName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });
  const [seatingData, setSeatingData] = useState([]);
  const [generatedArrangement, setGeneratedArrangement] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch classrooms
        const { data: classroomsData, error: classroomsError } = await supabase
          .from("classrooms")
          .select("id, classname");

        if (classroomsError) throw classroomsError;
        setClassrooms(classroomsData || []);

        // Check if classroom ID is provided in URL params

        console.log("Classroom data:", id); // Log the extracted ID instead

        // Fetch classroom name using classroomId
        if (id) {
          // Use the extracted ID
          const { data: classroomData, error: classroomError } = await supabase
            .from("classrooms")
            .select("classname")
            .eq("id", id) // Use the extracted ID
            .single();

          if (classroomError) throw classroomError;
          setClassroomName(classroomData?.classname || "");
        }

        // Fetch branches
        const { data: branchesData, error: branchesError } = await supabase
          .from("branches")
          .select("code");

        if (branchesError) throw branchesError;
        setBranches(branchesData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setStatusMessage({
          type: "error",
          message: `Failed to load data: ${error.message}`,
        });
      }
    };

    fetchData();
  }, [location.search]);

  const handleArrangementSubmit = async (e) => {
    e.preventDefault();
    if (!branch1 || !branch2 || !examId1 || !examId2 || !classroomId) {
      setStatusMessage({ type: "error", message: "Please fill all fields" });
      return;
    }

    try {
      setProcessing(true);
      setStatusMessage({ type: "", message: "" });

      // Pass additional parameter to indicate same row arrangement
      const result = await generateSeatingArr(
        examId1,
        examId2,
        classroomId,
        branch1,
        branch2,
        true // sameRowForBranch1 parameter
      );

      if (result.success) {
        setSeatingData(result.data);
        setGeneratedArrangement(true);
        setStatusMessage({
          type: "success",
          message: `Successfully arranged seats for ${branch1} and ${branch2}`,
        });
      } else {
        setStatusMessage({
          type: "error",
          message: result.message,
        });
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">
        Generate Seating Arrangement
      </h1>

      <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
        {statusMessage.type && (
          <div
            className={`p-4 mb-6 rounded-md flex items-center ${
              statusMessage.type === "success"
                ? "bg-green-50 text-green-700 border-l-4 border-green-500"
                : "bg-red-50 text-red-700 border-l-4 border-red-500"
            }`}
          >
            <span className="material-icons mr-2">
              {statusMessage.type === "success" ? "check_circle" : "error"}
            </span>
            {statusMessage.message}
          </div>
        )}

        <form onSubmit={handleArrangementSubmit} className="space-y-6">
          {classroomName && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Seating Plan for {classroomName}
              </h2>
              <p className="text-gray-500 text-sm">
                Configure the exam details below to generate arrangement
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch 1
              </label>
              <select
                value={branch1}
                onChange={async (e) => {
                  const selectedBranch = e.target.value;
                  setBranch1(selectedBranch);

                  if (selectedBranch) {
                    try {
                      // Fetch exams for the selected branch
                      const { data: examsData, error: examsError } =
                        await supabase
                          .from("exams")
                          .select(
                            "id, subject, subject_code, date, start_time, end_time, branch"
                          )
                          .eq("branch", selectedBranch);

                      if (examsError) throw examsError;

                      // Fetch branch name separately
                      const { data: branchData, error: branchError } =
                        await supabase
                          .from("branches")
                          .select("code, name")
                          .eq("code", selectedBranch)
                          .single();

                      if (branchError) throw branchError;

                      const branchName = branchData?.name || selectedBranch;

                      // Format exam names to include subject code and date
                      const formattedExams = examsData.map((exam) => ({
                        id: exam.id,
                        name: `${branchName} - ${exam.subject} (${new Date(
                          exam.date
                        ).toLocaleDateString()}, ${exam.start_time?.slice(
                          0,
                          5
                        )})`,
                      }));

                      setBranch1Exams(formattedExams || []);
                    } catch (error) {
                      console.error(
                        "Error fetching exams for branch 1:",
                        error
                      );
                      setStatusMessage({
                        type: "error",
                        message: `Failed to fetch exams: ${error.message}`,
                      });
                      setBranch1Exams([]);
                    }
                  } else {
                    setBranch1Exams([]);
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
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

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam 1
              </label>
              <select
                value={examId1}
                onChange={(e) => setExamId1(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
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

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch 2
              </label>
              <select
                value={branch2}
                onChange={async (e) => {
                  const selectedBranch = e.target.value;
                  setBranch2(selectedBranch);

                  if (selectedBranch) {
                    try {
                      // Fetch exams for the selected branch
                      const { data: examsData, error: examsError } =
                        await supabase
                          .from("exams")
                          .select(
                            "id, subject, subject_code, date, start_time, end_time, branch"
                          )
                          .eq("branch", selectedBranch);

                      if (examsError) throw examsError;

                      // Fetch branch name separately
                      const { data: branchData, error: branchError } =
                        await supabase
                          .from("branches")
                          .select("code, name")
                          .eq("code", selectedBranch)
                          .single();

                      if (branchError) throw branchError;

                      const branchName = branchData?.name || selectedBranch;

                      // Format exam names to include subject code and date
                      const formattedExams = examsData.map((exam) => ({
                        id: exam.id,
                        name: `${branchName} - ${exam.subject} (${new Date(
                          exam.date
                        ).toLocaleDateString()}, ${exam.start_time?.slice(
                          0,
                          5
                        )})`,
                      }));

                      setBranch2Exams(formattedExams || []);
                    } catch (error) {
                      console.error(
                        "Error fetching exams for branch 2:",
                        error
                      );
                      setStatusMessage({
                        type: "error",
                        message: `Failed to fetch exams: ${error.message}`,
                      });
                      setBranch2Exams([]);
                    }
                  } else {
                    setBranch2Exams([]);
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
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

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam 2
              </label>
              <select
                value={examId2}
                onChange={(e) => setExamId2(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
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
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mr-4 px-5 py-2.5 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              disabled={processing}
            >
              Back
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              disabled={processing}
            >
              {processing ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Generate Seating Arrangement"
              )}
            </button>
          </div>
        </form>
      </div>

      {generatedArrangement && (
        <div className="mt-10 bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
            Generated Seating Arrangement
          </h2>
          <SeatingArrangement
            allocatedSeats={seatingData}
            classroomId={classroomId}
          />
        </div>
      )}
    </div>
  );
};

export default SeatingGenForm;
