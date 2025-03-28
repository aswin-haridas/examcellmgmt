import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../services/supabase";
import { generateSeatingArr } from "../services/generateSeatingArr";
import SeatingArrangement from "./seatingArrangement";

const SeatingGenForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Define fixed branches
  const BRANCHES = [
    { code: "CSE", name: "Computer Science Engineering" },
    { code: "ECE", name: "Electronics & Communication Engineering" },
  ];

  const [form, setForm] = useState({
    classrooms: [],
    branch1: "",
    branch2: "",
    branch1Exams: [],
    branch2Exams: [],
    examId1: "",
    examId2: "",
    classroomId: id || "",
    classroomName: "",
  });
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [seatingData, setSeatingData] = useState([]);
  const [showArrangement, setShowArrangement] = useState(false);

  const updateForm = useCallback((updates) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  // Fetch classrooms on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only fetch classrooms since branches are predefined
        const { data: classroomsData, error: classroomsError } = await supabase
          .from("classrooms")
          .select("*");

        if (classroomsError)
          throw new Error(
            `Classrooms fetch failed: ${classroomsError.message}`
          );

        const updates = {
          classrooms: classroomsData || [],
        };

        // If a classroom ID is provided, fetch its details
        if (id) {
          const { data: classroom, error } = await supabase
            .from("classrooms")
            .select("*")
            .eq("id", id)
            .single();

          if (error)
            throw new Error(`Classroom fetch failed: ${error.message}`);

          updates.classroomName = classroom?.classname || "";
        }

        updateForm(updates);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setStatus({ type: "error", message: error.message });
      }
    };

    fetchData();
  }, [id, updateForm]);

  // Fetch exams for a branch (CSE or ECE)
  const fetchExams = useCallback(
    async (branch, branchNum) => {
      if (!branch) {
        updateForm(
          branchNum === 1
            ? { branch1Exams: [], examId1: "" }
            : { branch2Exams: [], examId2: "" }
        );
        return;
      }

      try {
        // Fetch exams for the selected branch
        const { data: examsData, error: examsError } = await supabase
          .from("exams")
          .select("*")
          .eq("branch", branch);

        if (examsError)
          throw new Error(`Exams fetch failed: ${examsError.message}`);

        // Create proper format with clear separation of id and display name
        const formattedExams = examsData.map((exam) => ({
          id: exam.id, // The actual UUID
          title: exam.subject,
          code: exam.id, // Keep this for backward compatibility
          name: `${branch} - ${exam.subject} (${new Date(
            exam.date
          ).toLocaleDateString()}, ${exam.start_time?.slice(0, 5)})`,
        }));

        updateForm(
          branchNum === 1
            ? { branch1Exams: formattedExams }
            : { branch2Exams: formattedExams }
        );
      } catch (error) {
        console.error(`Error fetching exams for branch ${branch}:`, error);
        setStatus({ type: "error", message: error.message });
        updateForm(
          branchNum === 1 ? { branch1Exams: [] } : { branch2Exams: [] }
        );
      }
    },
    [updateForm]
  );

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { branch1, branch2, examId1, examId2, classroomId } = form;

    // Form validation
    if (!branch1 || !branch2 || !examId1 || !examId2 || !classroomId) {
      setStatus({ type: "error", message: "All fields are required" });
      return;
    }

    // Prevent duplicate selections
    if (branch1 === branch2 && examId1 === examId2) {
      setStatus({
        type: "error",
        message: "Cannot use the same exam for both branches",
      });
      return;
    }

    setProcessing(true);
    setStatus({ type: "", message: "" });

    try {
      // Generate the seating arrangement
      const result = await generateSeatingArrangement(
        examId1,
        examId2,
        classroomId,
        branch1,
        branch2
      );

      setSeatingData(result.data || []);
      setShowArrangement(true);
    } catch (error) {
      console.error("Error generating arrangement:", error);
      setStatus({
        type: "error",
        message: `Failed to generate seating: ${
          error.message || "Unknown error"
        }`,
      });
    } finally {
      setProcessing(false);
    }
  };

  // Helper function to generate seating arrangement
  const generateSeatingArrangement = async (
    examId1,
    examId2,
    classroomId,
    branch1,
    branch2
  ) => {
    const result = await generateSeatingArr({
      examId1,
      examId2,
      classroomId,
      branch1,
      branch2,
      classroomName: form.classroomName,
    });

    if (!result) {
      throw new Error(
        "No response received from seating arrangement generation"
      );
    }

    if (!result.success) {
      throw new Error(
        result.message || "Failed to generate seating arrangement"
      );
    }

    return result;
  };

  // Reusable select component
  const Select = ({
    label,
    value,
    onChange,
    options,
    placeholder = `Select ${label}`,
    valueField = "code", // Add valueField parameter with default "code"
    displayField = "name", // Add displayField parameter with default "name"
  }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
        required
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option[valueField]} value={option[valueField]}>
            {option[displayField]}
          </option>
        ))}
      </select>
    </div>
  );

  // Status message component
  const StatusMessage = () =>
    status.message && (
      <div
        className={`p-4 mb-6 rounded-md flex items-center ${
          status.type === "success"
            ? "bg-green-50 text-green-700 border-l-4 border-green-500"
            : "bg-red-50 text-red-700 border-l-4 border-red-500"
        }`}
      >
        <span className="material-icons mr-2">
          {status.type === "success" ? "check_circle" : "error"}
        </span>
        {status.message}
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">
        Generate Seating Arrangement
      </h1>

      <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
        <StatusMessage />

        <form onSubmit={handleSubmit} className="space-y-6">
          {form.classroomName && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Seating Plan for {form.classroomName}
              </h2>
              <p className="text-gray-500 text-sm">
                Configure the exam details below to generate arrangement
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Select
              label="Branch 1"
              value={form.branch1}
              onChange={(e) => {
                const value = e.target.value;
                updateForm({ branch1: value, examId1: "" });
                fetchExams(value, 1);
              }}
              options={BRANCHES}
              valueField="code"
              displayField="name"
            />

            <Select
              label="Exam 1"
              value={form.examId1}
              onChange={(e) => updateForm({ examId1: e.target.value })}
              options={form.branch1Exams}
              valueField="code"
              displayField="name"
            />

            <Select
              label="Branch 2"
              value={form.branch2}
              onChange={(e) => {
                const value = e.target.value;
                updateForm({ branch2: value, examId2: "" });
                fetchExams(value, 2);
              }}
              options={BRANCHES}
              valueField="code"
              displayField="name"
            />

            <Select
              label="Exam 2"
              value={form.examId2}
              onChange={(e) => updateForm({ examId2: e.target.value })}
              options={form.branch2Exams}
              valueField="code"
              displayField="name"
            />
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
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

      {showArrangement && (
        <div className="mt-10 bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
            Generated Seating Arrangement
          </h2>
          <SeatingArrangement
            allocatedSeats={seatingData}
            classroomId={form.classroomId}
          />
        </div>
      )}
    </div>
  );
};

export default SeatingGenForm;
