import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { adminService } from "../services/api";
import Sidebar from "../components/Sidebar";

const AdminSeatingPlan = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [seatingArrangements, setSeatingArrangements] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [rowNumber, setRowNumber] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load exam details
        const examData = await adminService.getExamById(examId);
        setExam(examData);

        // Load existing seating arrangements
        const seatingData = await adminService.getSeatingArrangementByExam(
          examId
        );
        setSeatingArrangements(seatingData);

        // Load available students
        const studentsData = await adminService.getEligibleStudentsForExam(
          examId
        );
        setStudents(studentsData);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadData();
  }, [examId]);

  const handleAddSeat = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !seatNumber || !rowNumber) {
      alert("Please fill all fields");
      return;
    }

    try {
      const newSeating = {
        exam_id: examId,
        student_id: selectedStudent,
        seat_number: parseInt(seatNumber),
        row_number: parseInt(rowNumber),
      };

      await adminService.addSeatingArrangement(newSeating);

      // Refresh seating arrangements
      const seatingData = await adminService.getSeatingArrangementByExam(
        examId
      );
      setSeatingArrangements(seatingData);

      // Reset form
      setSelectedStudent("");
      setSeatNumber("");
      setRowNumber("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSeat = async (seatingId) => {
    try {
      await adminService.deleteSeatingArrangement(seatingId);

      // Refresh seating arrangements
      const seatingData = await adminService.getSeatingArrangementByExam(
        examId
      );
      setSeatingArrangements(seatingData);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error) return <div className="text-gray-800">Error: {error}</div>;

  return (
    <div className="flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          Seating Plan for {exam?.subject} Exam
        </h1>

        {exam && (
          <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Exam Details
            </h2>
            <p className="text-gray-700">
              Date: {new Date(exam.date).toLocaleDateString()}
            </p>
            <p className="text-gray-700">Time: {exam.time}</p>
            <p className="text-gray-700">
              Venue: {exam.classrooms?.classname || "Not assigned"}
            </p>
            <p className="text-gray-700">Duration: {exam.duration} minutes</p>
            <p className="text-gray-700">
              Capacity: {exam.classrooms?.capacity || "N/A"} seats
            </p>
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Add New Seating
          </h2>
          <form onSubmit={handleAddSeat} className="flex flex-wrap gap-4">
            <div className="w-full md:w-1/3">
              <label className="block mb-1 text-gray-700">Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 bg-white text-gray-800"
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-1/4">
              <label className="block mb-1 text-gray-700">Seat Number</label>
              <input
                type="number"
                value={seatNumber}
                onChange={(e) => setSeatNumber(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
                min="1"
              />
            </div>

            <div className="w-full md:w-1/4">
              <label className="block mb-1 text-gray-700">Row Number</label>
              <input
                type="number"
                value={rowNumber}
                onChange={(e) => setRowNumber(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
                min="1"
              />
            </div>

            <div className="w-full md:w-1/6 flex items-end">
              <button
                type="submit"
                className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded transition-colors"
              >
                Add Seat
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Current Seating Arrangement
          </h2>
          {seatingArrangements.length === 0 ? (
            <p className="text-gray-500">
              No seating arrangements defined yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-gray-700">
                      Student
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-gray-700">
                      Roll Number
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-gray-700">
                      Seat Number
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-gray-700">
                      Row Number
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {seatingArrangements.map((seat) => (
                    <tr key={seat.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b border-gray-200 text-gray-800">
                        {seat.users?.name}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200 text-gray-800">
                        {seat.users?.roll_number}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200 text-gray-800">
                        {seat.seat_number}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200 text-gray-800">
                        {seat.row_number}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        <button
                          onClick={() => handleDeleteSeat(seat.id)}
                          className="text-gray-700 hover:text-gray-900 underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSeatingPlan;
