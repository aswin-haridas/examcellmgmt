import React from "react";

const Legend = ({ seatingData }) => {
  if (!seatingData || seatingData.length === 0) return null;

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

export default Legend;