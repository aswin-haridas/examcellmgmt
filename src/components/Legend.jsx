import React from "react";

const Legend = ({ seatingData }) => {
  // Return null if no seating data or empty array
  if (!seatingData || seatingData.length === 0) return null;

  const uniqueBranches = new Set();

  // Check if seatingData is an array before calling forEach
  if (Array.isArray(seatingData)) {
    seatingData.forEach((seat) => {
      if (seat && seat.left_student)
        uniqueBranches.add(seat.left_student.branch);
      if (seat && seat.right_student)
        uniqueBranches.add(seat.right_student.branch);
    });
  } else if (seatingData.seating && Array.isArray(seatingData.seating)) {
    // If seatingData has a nested seating property that is an array
    seatingData.seating.forEach((seat) => {
      if (seat && seat.left_student)
        uniqueBranches.add(seat.left_student.branch);
      if (seat && seat.right_student)
        uniqueBranches.add(seat.right_student.branch);
    });
  } else {
    // If we can't process the data, return null instead of erroring
    console.warn(
      "Invalid seatingData format in Legend component:",
      seatingData
    );
    return null;
  }

  // If no branches found, return null
  if (uniqueBranches.size === 0) return null;

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
