import React from "react";
import supabase from "../services/supabase";
import { generateSeatingArr } from "../services/generateSeatingArr";

const Modal = ({
  showModal,
  setModal,
  branches,
  branch1,
  setBranch1,
  branch2,
  setBranch2,
  branch1Exams,
  setBranch1Exams,
  branch2Exams,
  setBranch2Exams,
  examId1,
  setExamId1,
  examId2,
  setExamId2,
  statusMessage,
  setStatusMessage,
  processing,
  setProcessing,
  classroomId,
  setSeatingData,
}) => {
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

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Generate Seating Arrangement</h3>
          <button
            onClick={() => setModal(false)}
            className="text-gray-600 hover:text-gray-900"
          >
            ×
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
            <label className="block text-sm font-medium mb-1">Branch 1</label>
            <select
              value={branch1}
              onChange={async (e) => {
                setBranch1(e.target.value);
                const { data, error } = await supabase
                  .from("exams")
                  .select("id, name")
                  .eq("branch_code", e.target.value);
                if (error) console.error("Error fetching exams:", error);
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
            <label className="block text-sm font-medium mb-1">Exam ID 1</label>
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
            <label className="block text-sm font-medium mb-1">Branch 2</label>
            <select
              value={branch2}
              onChange={async (e) => {
                setBranch2(e.target.value);
                const { data, error } = await supabase
                  .from("exams")
                  .select("id, name")
                  .eq("branch_code", e.target.value);
                if (error) console.error("Error fetching exams:", error);
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
            <label className="block text-sm font-medium mb-1">Exam ID 2</label>
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
  );
};

export default Modal;
