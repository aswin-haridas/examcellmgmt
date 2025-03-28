import React from "react";

const Bench = ({ index, benchData, getBranchColor }) => {
  const leftStudent = benchData?.left_student || null;
  const rightStudent = benchData?.right_student || null;
  const leftBgColor = getBranchColor(leftStudent);
  const rightBgColor = getBranchColor(rightStudent);

  return (
    <div className="relative bg-white border-2 border-gray-300 rounded-lg shadow-md mb-4 h-24 overflow-hidden transition-all hover:shadow-lg hover:scale-[1.01] hover:border-gray-400">
      <div className="absolute top-0 left-0 bg-gray-700 text-white text-xs px-2 py-1 rounded-br-md z-10">
        {index + 1}
      </div>
      <div className="flex h-full">
        <div className={`w-1/2 h-full flex items-center justify-center p-2 border-r border-gray-300 ${leftBgColor}`}>
          {leftStudent ? (
            <div className="text-center p-2 rounded-md w-full">
              <div className="font-bold text-sm truncate">{leftStudent.university_no}</div>
              <div className="text-xs text-gray-600 truncate max-w-[90px] mt-1 bg-white rounded-full px-2 py-0.5 border border-gray-200 inline-block">
                {leftStudent.branch}
              </div>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">Empty Seat</span>
          )}
        </div>
        <div className={`w-1/2 h-full flex items-center justify-center p-2 ${rightBgColor}`}>
          {rightStudent ? (
            <div className="text-center p-2 rounded-md w-full">
              <div className="font-bold text-sm truncate">{rightStudent.university_no}</div>
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
};

export default Bench;