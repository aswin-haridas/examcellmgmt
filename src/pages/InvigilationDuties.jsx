import React, { useEffect, useState } from "react";
import supabase from "../services/supabase";

const InvigilationDuties = () => {
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvigilationDetails = async () => {
      try {
        // First fetch invigilation duties
        const { data: invigilationData, error: invigilationError } =
          await supabase.from("invigilation").select("*");

        if (invigilationError) throw invigilationError;
        if (!invigilationData || invigilationData.length === 0) {
          setDuties([]);
          setLoading(false); // Add this line to finish loading after data is fetched
          return;
        }

        // Extract unique classroom IDs and faculty IDs
        const classroomIds = [
          ...new Set(
            invigilationData
              .filter((duty) => duty.classroom_id)
              .map((duty) => duty.classroom_id)
          ),
        ];

        const facultyIds = [
          ...new Set(
            invigilationData
              .filter((duty) => duty.faculty_id)
              .map((duty) => duty.faculty_id)
          ),
        ];

        // Fetch classroom details
        const { data: classrooms, error: classroomError } = await supabase
          .from("classrooms")
          .select("*")
          .in("id", classroomIds);

        if (classroomError) throw classroomError;

        // Fetch faculty details
        const { data: faculty, error: facultyError } = await supabase
          .from("users")
          .select("*")
          .in("id", facultyIds);

        if (facultyError) throw facultyError;

        // Map all details to invigilation duties
        const updatedDuties = invigilationData.map((duty) => ({
          ...duty,
          classroom: classrooms.find((c) => c.id === duty.classroom_id) || null,
          faculty: faculty.find((f) => f.id === duty.faculty_id) || null,
        }));

        setDuties(updatedDuties);
        setLoading(false); // Add this line to finish loading after data is fetched
      } catch (error) {
        console.error("Error fetching invigilation details:", error);
        setError("Failed to load invigilation details");
        setLoading(false); // Add this line to finish loading even if there's an error
      }
    };

    fetchInvigilationDetails();
  }, []); // Empty dependency array since we're fetching initial data

  return (
    <div className="p-6 w-full mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-2">
        Invigilation Duties
      </h1>

      {loading && (
        <p className="text-gray-600">Loading invigilation details...</p>
      )}

      {error && (
        <div className="bg-gray-200 text-gray-800 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {duties.length === 0 ? (
            <p className="text-gray-600">No invigilation duties found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {duties.map((duty) => (
                <div
                  key={duty.id}
                  className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 bg-white"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {duty.classroom?.classname || "Unknown Classroom"}
                    </h2>
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 p-1 rounded">
                      ID: {duty.id.substring(0, 8)}...
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Faculty:</span>
                      <span className="font-medium">
                        {duty.faculty?.name || "Unassigned"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">
                        {duty.classroom.capacity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Benches:</span>
                      <span className="font-medium">
                        {duty.classroom.bench_count}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {new Date(duty.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <button className="text-gray-700 hover:text-gray-900 border border-gray-300 px-3 py-1 rounded hover:bg-gray-50">
                      Edit
                    </button>
                    <button className="text-gray-700 hover:text-gray-900 border border-gray-300 px-3 py-1 rounded hover:bg-gray-50">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <button className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50">
              Add New Invigilation Duty
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default InvigilationDuties;
