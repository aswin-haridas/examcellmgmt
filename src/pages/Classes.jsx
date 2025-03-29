import React, { useEffect, useState } from "react";
import supabase from "../services/supabase";
import { useNavigate } from "react-router-dom";
import useVerifyUser from "../services/useVerifyUser";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classroomToDelete, setClassroomToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClassroom, setNewClassroom] = useState({
    classname: "",
    capacity: "",
    bench_count: "",
  });
  const [addError, setAddError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const userRole = useVerifyUser(); // Get the current user's role

  useEffect(() => {
    fetchClasses();
  }, []);

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

  const handleDeleteClick = (classroom) => {
    setClassroomToDelete(classroom);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!classroomToDelete) return;

    try {
      setIsDeleting(true);

      // First check if the classroom has allocated seating data
      const { data: seatingData, error: seatingError } = await supabase
        .from("classroom_seating")
        .select("*")
        .eq("classroom_id", classroomToDelete.id);

      if (seatingError) throw seatingError;

      // Delete seating data if it exists
      if (seatingData && seatingData.length > 0) {
        const { error: deleteSeatingError } = await supabase
          .from("classroom_seating")
          .delete()
          .eq("classroom_id", classroomToDelete.id);

        if (deleteSeatingError) throw deleteSeatingError;
      }

      // Delete the classroom record
      const { error: deleteClassroomError } = await supabase
        .from("classrooms")
        .delete()
        .eq("id", classroomToDelete.id);

      if (deleteClassroomError) throw deleteClassroomError;

      // Update the local state by removing the deleted classroom
      setClasses(classes.filter((c) => c.id !== classroomToDelete.id));
      setShowDeleteModal(false);
      setClassroomToDelete(null);
    } catch (error) {
      console.error("Error deleting classroom:", error);
      setError("Failed to delete classroom");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddClassroom = async (e) => {
    e.preventDefault();
    setAddError("");

    // Validate form
    if (
      !newClassroom.classname ||
      !newClassroom.capacity ||
      !newClassroom.bench_count
    ) {
      setAddError("All fields are required");
      return;
    }

    // Validate numeric fields
    if (
      isNaN(Number(newClassroom.capacity)) ||
      isNaN(Number(newClassroom.bench_count))
    ) {
      setAddError("Capacity and bench count must be numbers");
      return;
    }

    try {
      setIsSubmitting(true);
      const { data, error } = await supabase
        .from("classrooms")
        .insert([
          {
            classname: newClassroom.classname,
            capacity: parseInt(newClassroom.capacity),
            bench_count: parseInt(newClassroom.bench_count),
          },
        ])
        .select();

      if (error) throw error;

      // Add the new classroom to the state
      setClasses([...classes, data[0]]);
      setShowAddModal(false);
      setNewClassroom({ classname: "", capacity: "", bench_count: "" });
    } catch (error) {
      console.error("Error adding classroom:", error);
      setAddError(error.message || "Failed to add classroom");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClassroom({ ...newClassroom, [name]: value });
  };

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
                    {userRole === "admin" && (
                      <button
                        className="text-red-600 hover:text-red-800 border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
                        onClick={() => handleDeleteClick(classroom)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {userRole === "admin" && (
            <div className="mt-6">
              <button
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50"
                onClick={() => setShowAddModal(true)}
              >
                Add New Classroom
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete classroom{" "}
              <span className="font-semibold">
                {classroomToDelete?.classname}
              </span>
              ? This action cannot be undone and will remove all seating
              arrangements.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setClassroomToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Classroom Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Classroom</h2>

            {addError && (
              <div className="bg-red-50 text-red-700 p-3 rounded mb-4 border border-red-200">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddClassroom}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Classroom Name
                </label>
                <input
                  type="text"
                  name="classname"
                  value={newClassroom.classname}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="e.g., Room 101"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={newClassroom.capacity}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="e.g., 60"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Bench Count
                </label>
                <input
                  type="number"
                  name="bench_count"
                  value={newClassroom.bench_count}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="e.g., 30"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewClassroom({
                      classname: "",
                      capacity: "",
                      bench_count: "",
                    });
                    setAddError("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    "Create Classroom"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
