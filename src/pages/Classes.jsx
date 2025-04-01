import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../services/supabase";
import useVerifyUser from "../services/useVerifyUser";

// Component imports would go here
import DeleteModal from "../components/modals/DeleteModal";
import AddClassroomModal from "../components/modals/AddClassroomModal";
import ClassroomCard from "../components/classroom/ClassroomCard";

const Classes = () => {
  // State management
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [classroomToDelete, setClassroomToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [newClassroom, setNewClassroom] = useState({
    classname: "",
    capacity: "",
    bench_count: "",
  });
  const [addError, setAddError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Invigilation states
  const [invigilationStatus, setInvigilationStatus] = useState({
    message: "",
    type: "",
    examId: null,
  });

  const navigate = useNavigate();
  const userRole = useVerifyUser();

  // Data fetching
  useEffect(() => {
    fetchClasses();
    fetchExams();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("classrooms").select("*");

      if (error) throw error;

      console.log("Fetched classrooms:", data);
      setClasses(data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setError("Failed to load classrooms data");
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  /**
   * Retrieves allocated students data from classrooms
   * @returns {Object} Object containing student allocation data
   */
  const fetchAllocatedStudents = async (classroomId) => {
    try {
      // Query only the specific classroom if ID is provided
      const query = supabase.from("classrooms").select("allocated_students");

      if (classroomId) {
        query.eq("id", classroomId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process data only if results exist
      if (!data || data.length === 0) {
        return { allocatedStudents: [], firstStudent: null, lastStudent: null };
      }

      const allocatedStudents = data[0]?.allocated_students || [];

      return {
        allocatedStudents,
        firstStudent: allocatedStudents[0] || null,
        lastStudent:
          allocatedStudents.length > 0
            ? allocatedStudents[allocatedStudents.length - 1]
            : null,
        count: allocatedStudents.length,
      };
    } catch (error) {
      console.error("Error fetching allocated students:", error);
      return {
        allocatedStudents: [],
        firstStudent: null,
        lastStudent: null,
        count: 0,
      };
    }
  };

  // Classroom management functions
  const handleDeleteClick = (classroom) => {
    setClassroomToDelete(classroom);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!classroomToDelete) return;

    try {
      setIsDeleting(true);

      // Check for existing seating data
      const { data: seatingData, error: seatingError } = await supabase
        .from("classroom_seating")
        .select("*")
        .eq("classroom_id", classroomToDelete.id);

      if (seatingError) throw seatingError;

      // Delete seating data if it exists
      if (seatingData?.length > 0) {
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

      // Update local state
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

    if (!validateClassroomForm()) return;

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

      setClasses([...classes, data[0]]);
      resetAddClassroomForm();
    } catch (error) {
      console.error("Error adding classroom:", error);
      setAddError(error.message || "Failed to add classroom");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateClassroomForm = () => {
    // Validate required fields
    if (
      !newClassroom.classname ||
      !newClassroom.capacity ||
      !newClassroom.bench_count
    ) {
      setAddError("All fields are required");
      return false;
    }

    // Validate numeric fields
    if (
      isNaN(Number(newClassroom.capacity)) ||
      isNaN(Number(newClassroom.bench_count))
    ) {
      setAddError("Capacity and bench count must be numbers");
      return false;
    }

    return true;
  };

  const resetAddClassroomForm = () => {
    setShowAddModal(false);
    setNewClassroom({ classname: "", capacity: "", bench_count: "" });
    setAddError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClassroom({ ...newClassroom, [name]: value });
  };

  // Invigilation functions
  const handleInvigilate = async (classroom) => {
    try {
      const exam = exams.find((e) => e.classroom_id === classroom.id);

      if (!exam) {
        setInvigilationStatus({
          message: "No exam scheduled for this classroom.",
          type: "error",
          examId: null,
        });
        return;
      }

      const userData = JSON.parse(sessionStorage.getItem("user"));

      if (!userData?.id) {
        setInvigilationStatus({
          message: "User information not found. Please log in again.",
          type: "error",
          examId: exam.id,
        });
        return;
      }

      // Create invigilation record
      const invigilation = {
        exam_id: exam.id,
        faculty_id: userData.id,
        classroom_id: exam.classroom_id,
      };

      const { error } = await supabase
        .from("invigilation")
        .insert([invigilation]);
      if (error) throw error;

      // Refresh exams data
      await refreshExamsData();

      setInvigilationStatus({
        message: "You have been assigned as an invigilator for this exam.",
        type: "success",
        examId: exam.id,
      });
    } catch (err) {
      console.error("Invigilation error:", err);
      setInvigilationStatus({
        message: "Failed to register as invigilator. Please try again.",
        type: "error",
        examId: null,
      });
    }
  };

  const refreshExamsData = async () => {
    try {
      const { data, error } = await supabase
        .from("exams")
        .select(`*, invigilation:invigilation(*, faculty:faculty_id(id, name))`)
        .order("date", { ascending: true });

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error("Error refreshing exams data:", error);
    }
  };

  // Render helper functions
  const renderClassroomGrid = () => {
    if (classes.length === 0) {
      return <p className="text-gray-600">No classrooms found.</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {classes.map((classroom) => {
          const exam = exams.find((e) => e.classroom_id === classroom.id);

          // Get first and last students if exam exists and has allocated students
          const firstStudent = exam?.allocated_students?.[0] || null;
          const lastStudent =
            exam?.allocated_students?.length > 0
              ? exam.allocated_students[exam.allocated_students.length - 1]
              : null;

          return (
            <ClassroomCard
              key={classroom.id}
              classroom={classroom}
              exam={exam}
              userRole={userRole}
              firstStudent={firstStudent}
              lastStudent={lastStudent}
              studentCount={exam?.allocated_students?.length || 0}
              invigilationStatus={invigilationStatus}
              onInvigilate={() => handleInvigilate(classroom)}
              onDelete={() => handleDeleteClick(classroom)}
              onViewSeating={() =>
                navigate(`/classrooms/class/${classroom.id}`)
              }
            />
          );
        })}
      </div>
    );
  };

  // Main component render
  return (
    <div className="p-6 w-full mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-2">
        Classrooms
      </h1>

      {loading && <LoadingSpinner message="Loading classrooms data..." />}
      {error && <ErrorAlert message={error} />}

      {!loading && !error && (
        <>
          {renderClassroomGrid()}

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

      {/* Modal components */}
      {showDeleteModal && (
        <DeleteModal
          isOpen={showDeleteModal}
          isDeleting={isDeleting}
          itemName={classroomToDelete?.classname}
          onCancel={() => {
            setShowDeleteModal(false);
            setClassroomToDelete(null);
          }}
          onConfirm={confirmDelete}
        />
      )}

      {showAddModal && (
        <AddClassroomModal
          isOpen={showAddModal}
          isSubmitting={isSubmitting}
          classroom={newClassroom}
          error={addError}
          onChange={handleInputChange}
          onSubmit={handleAddClassroom}
          onCancel={resetAddClassroomForm}
        />
      )}
    </div>
  );
};

// Component definitions for modularity
// These would typically be in separate files

const LoadingSpinner = ({ message }) => (
  <p className="text-gray-600">{message}</p>
);

const ErrorAlert = ({ message }) => (
  <div className="bg-gray-200 text-gray-800 p-4 rounded-md mb-4">
    <p>{message}</p>
  </div>
);

export default Classes;
