import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useParams } from "react-router-dom";
import { studentService } from "../services/api";

const seatingData = [
  [
    {
      left: { label: "S1 CSE 01", status: "0" },
      right: { label: "S1 ECE 01", status: "0" },
    },
    {
      left: { label: "S1 CSE 02", status: "0" },
      right: { label: "S1 ECE 02", status: "0" },
    },
    {
      left: { label: "S1 CSE 03", status: "0" },
      right: { label: "S1 ECE 03", status: "0" },
    },
    {
      left: { label: "S1 CSE 04", status: "0" },
      right: { label: "S1 ECE 04", status: "0" },
    },
    {
      left: { label: "S1 CSE 05", status: "0" },
      right: { label: "S1 ECE 05", status: "0" },
    },
  ],
  [
    {
      left: { label: "S1 AI 01", status: "0" },
      right: { label: "S1 CSE 06", status: "0" },
    },
    {
      left: { label: "S1 AI 02", status: "0" },
      right: { label: "S1 CSE 07", status: "0" },
    },
    {
      left: { label: "S1 AI 03", status: "0" },
      right: { label: "S1 CSE 08", status: "0" },
    },
    {
      left: { label: "S1 AI 04", status: "0" },
      right: { label: "S1 CSE 09", status: "0" },
    },
    {
      left: { label: "S1 AI 05", status: "0" },
      right: { label: "S1 CSE 10", status: "0" },
    },
  ],
  [
    {
      left: { label: "S1 AI 06", status: "0" },
      right: { label: "S1 ECE 06", status: "0" },
    },
    {
      left: { label: "S1 AI 07", status: "0" },
      right: { label: "S1 ECE 07", status: "0" },
    },
    {
      left: { label: "S1 AI 08", status: "0" },
      right: { label: "S1 ECE 08", status: "0" },
    },
    {
      left: { label: "S1 AI 09", status: "0" },
      right: { label: "S1 ECE 09", status: "0" },
    },
    {
      left: { label: "S1 AI 10", status: "0" },
      right: { label: "S1 ECE 10", status: "0" },
    },
  ],
];

function SeatingArr() {
  const { examId } = useParams();
  const [seatingArrangement, setSeatingArrangement] = useState(seatingData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeatingData = async () => {
      try {
        setLoading(true);
        const data = await studentService.getSeatingArrangement(examId);
        if (data && data.length > 0) {
          // Process data if needed
          // For now, we'll keep using the default seatingData
          // setSeatingArrangement(processedData);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch seating arrangement data");
        setLoading(false);
        console.error(err);
      }
    };

    if (examId) {
      fetchSeatingData();
    }
  }, [examId]);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8 flex justify-center items-center">
          <p>Loading seating arrangement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8 flex justify-center items-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-mono-100 w-full">
        <div className="bg-white rounded-lg p-6 border border-mono-300 max-w-full">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-mono-900">
              CLASS ROOM: A309
            </h1>
            <p className="text-md text-gray-600">Exam ID: {examId}</p>
            <div className="h-12 bg-mono-200 mt-2 rounded flex items-center justify-center">
              <span className="font-medium">TEACHER'S DESK</span>
            </div>
          </div>

          <div className="flex justify-between gap-8 mt-8">
            {seatingArrangement.map((column, colIndex) => (
              <div key={`col-${colIndex}`} className="flex-[1_1_400px]">
                {column.map((bench, benchIndex) => (
                  <div
                    key={`bench-${colIndex}-${benchIndex}`}
                    className="mb-1 border border-mono-400 rounded-md p-0.5 bg-mono-100 shadow-sm"
                  >
                    <div className="flex justify-between">
                      <div
                        className="flex-[1_1_180px] p-1 rounded-full m-1 text-center"
                        style={{ backgroundColor: "#E2E8FF" }}
                      >
                        <p className="text-mono-800 font-semibold">
                          {bench.left.label}
                        </p>
                      </div>

                      <div
                        className="flex-[1_1_180px] p-1 rounded-full m-1 text-center"
                        style={{ backgroundColor: "#F0E7FF" }}
                      >
                        <p className="text-mono-800 font-semibold">
                          {bench.right.label}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="text-right mt-4">
            <p className="text-mono-600">Date: 11-11-2024</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeatingArr;
