import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  const [error, setError] = useState(null);

  const totalBenches = 18;
  const role = localStorage.getItem("role");

  // Fetch seating data only once on component mount
  useEffect(() => {
    const fetchDefaultSeatingData = async () => {
      try {
        setLoading(true);
        setError(null);
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
        setError(err.message || "Failed to load seating data");
      } finally {
        setLoading(false);
      }
    };

    if (allocatedSeats) {
      // Handle different formats of allocatedSeats
      if (Array.isArray(allocatedSeats) && allocatedSeats[0]?.seating_data) {
        setSeatingData(allocatedSeats[0].seating_data);
      } else if (
        Array.isArray(allocatedSeats) &&
        allocatedSeats.length > 0 &&
        allocatedSeats[0]?.bench_row
      ) {
        // Direct array of bench data
        setSeatingData(allocatedSeats);
      } else {
        // Object with seating_data property
        setSeatingData(allocatedSeats.seating_data || []);
      }
      setLoading(false);
    } else {
      fetchDefaultSeatingData();
    }
  }, [allocatedSeats, classroomId]);

  // Cache unique branches to avoid recalculating on every render
  const uniqueBranches = useMemo(() => {
    const branchSet = new Set();
    if (Array.isArray(seatingData)) {
      seatingData.forEach((seat) => {
        if (seat?.left_student?.branch) branchSet.add(seat.left_student.branch);
        if (seat?.right_student?.branch)
          branchSet.add(seat.right_student.branch);
      });
    }
    return [...branchSet];
  }, [seatingData]);

  // Memoize branch color function to improve performance
  const getBranchColor = useCallback(
    (student) => {
      if (!student) return "bg-gray-50";

      const colorMap = {
        0: "bg-blue-100",
        1: "bg-green-100",
        2: "bg-yellow-100",
        3: "bg-purple-100",
        4: "bg-pink-100",
        5: "bg-orange-100",
      };

      const branchIndex = uniqueBranches.indexOf(student.branch);
      return branchIndex >= 0
        ? colorMap[branchIndex] || "bg-gray-100"
        : "bg-gray-100";
    },
    [uniqueBranches]
  );

  // Memoize benches to prevent unnecessary re-renders
  const benches = useMemo(() => {
    return Array.from({ length: totalBenches }, (_, index) => {
      const benchData = Array.isArray(seatingData)
        ? seatingData.find((seat) => seat?.bench_row === index + 1)
        : null;
      return (
        <Bench
          key={index}
          index={index}
          benchData={benchData}
          getBranchColor={getBranchColor}
        />
      );
    });
  }, [seatingData, getBranchColor, totalBenches]);

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200 shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-center text-red-800">
          Error Loading Seating Arrangement
        </h2>
        <p className="text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 mx-auto block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
        {className} Seating Arrangement
      </h2>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-gray-800 mb-2"></div>
          <p className="mt-2">Loading seating arrangement...</p>
        </div>
      ) : (
        <>
          <Legend seatingData={seatingData} />

          {(!seatingData ||
            !Array.isArray(seatingData) ||
            seatingData.length === 0) && (
            <div className="mt-6 text-center text-sm bg-amber-50 text-amber-700 p-4 rounded-md border border-amber-200">
              No students available to allocate seats for this exam
            </div>
          )}

          <TeacherDesk />

          <div className="px-8 py-6 bg-gray-100 rounded-lg border border-gray-200 shadow-inner">
            <div className="mb-3 flex justify-end items-center">
              <span className="text-xs text-gray-500">
                Total benches: {totalBenches}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {benches}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(SeatingArrangement);
