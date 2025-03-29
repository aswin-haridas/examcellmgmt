import React, { useEffect, useState } from "react";
import supabase from "../services/supabase";

const InvigilationDuties = () => {
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDuty, setEditingDuty] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [faculty, setFaculty] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dutyToDelete, setDutyToDelete] = useState(null);

  const [formData, setFormData] = useState({
    faculty_id: "",
    classroom_id: "",
    date: "",
  });

  useEffect(() => {
    fetchInvigilationDetails();
  }, []); // Empty dependency array since we're fetching initial data

  const fetchInvigilationDetails = async () => {
    try {
      setLoading(true);

      // First fetch invigilation duties
      const { data: invigilationData, error: invigilationError } =
        await supabase.from("invigilation").select("*");

      if (invigilationError) throw invigilationError;

      // Fetch all classrooms and faculty for the form
      const { data: allClassrooms, error: allClassroomsError } = await supabase
        .from("classrooms")
        .select("*");

      if (allClassroomsError) throw allClassroomsError;
      setClassrooms(allClassrooms || []);

      const { data: allFaculty, error: allFacultyError } = await supabase
        .from("users")
        .select("*")
        .eq("role", "faculty");

      if (allFacultyError) throw allFacultyError;
      setFaculty(allFaculty || []);

      if (!invigilationData || invigilationData.length === 0) {
        setDuties([]);
        setLoading(false);
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
      const { data: classroomsData, error: classroomError } = await supabase
        .from("classrooms")
        .select("*")
        .in("id", classroomIds);

      if (classroomError) throw classroomError;

      // Fetch faculty details
      const { data: facultyData, error: facultyError } = await supabase
        .from("users")
        .select("*")
        .in("id", facultyIds);

      if (facultyError) throw facultyError;

      // Map all details to invigilation duties
      const updatedDuties = invigilationData.map((duty) => ({
        ...duty,
        classroom:
          classroomsData.find((c) => c.id === duty.classroom_id) || null,
        faculty: facultyData.find((f) => f.id === duty.faculty_id) || null,
      }));

      setDuties(updatedDuties);
    } catch (error) {
      console.error("Error fetching invigilation details:", error);
      setError("Failed to load invigilation details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (duty) => {
    setEditingDuty(duty);
    setFormData({
      faculty_id: duty.faculty_id || "",
      classroom_id: duty.classroom_id || "",
      date: duty.date ? new Date(duty.date).toISOString().split("T")[0] : "",
    });
    setShowModal(true);
  };

  const handleDeleteClick = (duty) => {
    setDutyToDelete(duty);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!dutyToDelete) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("invigilation")
        .delete()
        .eq("id", dutyToDelete.id);

      if (error) throw error;

      setDuties(duties.filter((duty) => duty.id !== dutyToDelete.id));
      setShowConfirmation(false);
      setDutyToDelete(null);
    } catch (error) {
      console.error("Error deleting duty:", error);
      setFormError("Failed to delete duty. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    try {
      setIsSubmitting(true);

      // Validate form
      if (!formData.faculty_id || !formData.classroom_id || !formData.date) {
        setFormError("All fields are required");
        return;
      }

      if (editingDuty) {
        // Update existing duty
        const { error } = await supabase
          .from("invigilation")
          .update({
            faculty_id: formData.faculty_id,
            classroom_id: formData.classroom_id,
            date: formData.date,
          })
          .eq("id", editingDuty.id);

        if (error) throw error;
      } else {
        // Create new duty
        const { error } = await supabase
          .from("invigilation")
          .insert([formData]);
        if (error) throw error;
      }

      // Refresh data
      await fetchInvigilationDetails();

      // Reset form and close modal
      setFormData({ faculty_id: "", classroom_id: "", date: "" });
      setShowModal(false);
      setEditingDuty(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormError(error.message || "Failed to save invigilation duty");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                        {duty.classroom?.capacity || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Benches:</span>
                      <span className="font-medium">
                        {duty.classroom?.bench_count || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {duty.date
                          ? new Date(duty.date).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => handleEditClick(duty)}
                      className="text-gray-700 hover:text-gray-900 border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(duty)}
                      className="text-red-600 hover:text-red-800 border border-red-200 px-3 py-1 rounded hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={() => {
                setEditingDuty(null);
                setFormData({ faculty_id: "", classroom_id: "", date: "" });
                setShowModal(true);
              }}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50"
            >
              Add New Invigilation Duty
            </button>
          </div>
        </>
      )}

      {/* Modal for adding/editing invigilation duty */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingDuty ? "Edit Invigilation Duty" : "Add Invigilation Duty"}
            </h2>

            {formError && (
              <div className="bg-red-50 text-red-700 p-3 rounded mb-4 border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Faculty
                </label>
                <select
                  name="faculty_id"
                  value={formData.faculty_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="">Select Faculty</option>
                  {faculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Classroom
                </label>
                <select
                  name="classroom_id"
                  value={formData.classroom_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="">Select Classroom</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.classname} ({c.capacity} capacity)
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                      Processing...
                    </span>
                  ) : editingDuty ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete this invigilation duty? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
    </div>
  );
};

export default InvigilationDuties;
