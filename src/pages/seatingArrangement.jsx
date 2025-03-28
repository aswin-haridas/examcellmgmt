import React from "react";
import Classroom from "../components/Class";
import Sidebar from "../components/Sidebar";

const SeatingArrangement = () => {
  return (
    <div className="flex">
      <div className="sticky top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-sm overflow-hidden">
        <Sidebar />
      </div>
      <div className="flex-1">
        <Classroom />
      </div>
    </div>
  );
};

export default SeatingArrangement;
