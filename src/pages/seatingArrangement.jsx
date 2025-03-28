import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../services/supabase";
import Bench from "../components/Bench";
import Legend from "../components/Legend";
import TeacherDesk from "../components/TeacherDesk";

const SeatingArrangement = ({
  allocatedSeats = null,
  className = "Classroom",
  classroomId = "0352d0dc-585a-4f55-940a-636b3dd98c42",
}) => {
  const navigate = useNavigate();
  const [seatingData, setSeatingData] = useState([]);
  const [loading, setLoading] = useState(true);

  const totalBenches = 18;
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchDefaultSeatingData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("classroom_seating")
          .select("seating_data")
          .eq("classroom_id", classroomId);

        if (error) throw error;
        if (data && data.length > 0) {
          setSeatingData(data[0].seating_data);
        }
      } catch (err) {
        console.error("Failed to fetch seating data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (allocatedSeats) {
      setSeatingData(
        allocatedSeats.length > 0 && allocatedSeats[0].seating_data
          ? allocatedSeats[0].seating_data
          : allocatedSeats
      );
      setLoading(false);
    } else {
      fetchDefaultSeatingData();
    }
  }, [allocatedSeats, classroomId]);

  const getBranchColor = (student) => {
    if (!student) return "bg-gray-50";
    const uniqueBranches = new Set();
    seatingData.forEach((seat) => {
      if (seat.left_student) uniqueBranches.add(seat.left_student.branch);
      if (seat.right_student) uniqueBranches.add(seat.right_student.branch);
    });
    const branchesArray = [...uniqueBranches];

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

  const renderBenches = () => {
    return Array.from({ length: totalBenches }, (_, index) => {
      const benchData = seatingData.find(
        (seat) => seat.bench_row === index + 1
      );
      return (
        <Bench
          key={index}
          index={index}
          benchData={benchData}
          getBranchColor={getBranchColor}
        />
      );
    });
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
          <Legend seatingData={seatingData} />

          {seatingData.length === 0 && (
            <div className="mt-6 text-center text-sm bg-amber-50 text-amber-700 p-4 rounded-md border border-amber-200">
              No students available to allocate seats for this exam
            </div>
          )}

          {role === "admin" && (
            <button
              onClick={() => navigate("/generate-seating")}
              className="bg-black rounded-md text-white p-2 mb-4 hover:bg-gray-800 transition-colors"
            >
              Generate New Seating Arrangement
            </button>
          )}

          <TeacherDesk />

          <div className="px-8 py-6 bg-gray-100 rounded-lg border border-gray-200 shadow-inner">
            <div className="mb-3 flex justify-end items-center">
              <span className="text-xs text-gray-500">
                Total benches: {totalBenches}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderBenches()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SeatingArrangement;
