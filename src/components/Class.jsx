import React, { useState, useEffect } from "react";

const StgAgmnt = ({ allocatedSeats = null, className = "Classroom" }) => {
  const [seatingData, setSeatingData] = useState(null);
  const totalBenches = 15; // As defined in generateSeatingArr.js

  useEffect(() => {
    if (allocatedSeats) {
      setSeatingData(allocatedSeats);
    }
  }, [allocatedSeats]);

  // Create array of student benches
  const renderBenches = () => {
    return Array.from({ length: totalBenches }, (_, index) => {
      // Get students assigned to this bench if available
      const benchData =
        seatingData && seatingData.find((seat) => seat.bench_row === index + 1);
      const leftStudent = benchData?.left_student || null;
      const rightStudent = benchData?.right_student || null;

      // Calculate different colors based on branch if available
      const leftBgColor = leftStudent
        ? leftStudent.branch === benchData?.branch1
          ? "bg-blue-100"
          : "bg-green-100"
        : "bg-gray-50";
      const rightBgColor = rightStudent
        ? rightStudent.branch === benchData?.branch1
          ? "bg-blue-100"
          : "bg-green-100"
        : "bg-gray-50";

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
                    {leftStudent.branch_name}
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
                    {rightStudent.branch_name}
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

  return (
    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
        {className} Seating Arrangement
      </h2>

      {/* Branch legend when seating data exists */}
      {seatingData && seatingData.length > 0 && (
        <div className="flex justify-center mb-4 gap-4">
          <div className="flex items-center">
            <span className="w-4 h-4 bg-blue-100 border border-blue-200 rounded-sm inline-block mr-1"></span>
            <span className="text-sm text-gray-600">Branch 1</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-green-100 border border-green-200 rounded-sm inline-block mr-1"></span>
            <span className="text-sm text-gray-600">Branch 2</span>
          </div>
        </div>
      )}

      {/* Teacher's desk at the front */}
      <div className="w-full flex justify-center mb-8">
        <div className="bg-indigo-100 border-2 border-indigo-300 rounded-lg w-1/3 h-16 flex items-center justify-center shadow-md">
          <span className="font-medium text-indigo-800">Teacher's Desk</span>
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

      {!seatingData && (
        <div className="mt-6 text-center text-sm bg-amber-50 text-amber-700 p-4 rounded-md border border-amber-200">
          Select branches and click "Generate Seating Arrangement" to allocate
          students to benches
        </div>
      )}

      {seatingData && seatingData.length === 0 && (
        <div className="mt-6 text-center text-sm bg-amber-50 text-amber-700 p-4 rounded-md border border-amber-200">
          No students available to allocate seats for this exam
        </div>
      )}
    </div>
  );
};

export default StgAgmnt;
