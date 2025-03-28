import React, { useEffect, useState } from "react";
import supabase from "../services/supabase";
import { useNavigate } from "react-router-dom";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("classrooms").select("*");

        if (error) throw error;

        setClasses(data || []);
      } catch (error) {
        console.error("Error fetching classes:", error);
        setError("Failed to load classrooms data");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  return (
    <div className="p-6 w-full mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-2">
        Classrooms
      </h1>

      {loading && <p className="text-gray-600">Loading classrooms data...</p>}

      {error && (
        <div className="bg-gray-200 text-gray-800 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {classes.length === 0 ? (
            <p className="text-gray-600">No classrooms found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {classes.map((classroom) => (
                <div
                  key={classroom.id}
                  className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 bg-white"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {classroom.classname}
                    </h2>
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 p-1 rounded">
                      ID: {classroom.id.substring(0, 8)}...
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">{classroom.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Benches:</span>
                      <span className="font-medium">
                        {classroom.bench_count}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      className="text-white bg-black hover:bg-gray-800 border border-gray-300 px-3 py-1 rounded"
                      onClick={() =>
                        navigate(`/classrooms/class/${classroom.id}`)
                      }
                    >
                      View Seating
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
              Add New Classroom
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Classes;
