import supabase from "../lib/supabase";
import { adminService } from "./api";

// Constants
const MAX_BENCHES_PER_CLASSROOM = 15;

const getEligibleStudentsForExam = async (branch) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "student")
    .eq("branch", branch);

  if (error) throw new Error(error.message);
  return data || [];
};

// Add a new function to generate seating arrangements
const generateSeatingArrangement = async (
  examId,
  classroomId,
  { branch1, branch2 }
) => {
  try {
    // Get students from both branches
    const branch1Students = await getEligibleStudentsForExam(branch1);
    const branch2Students = await getEligibleStudentsForExam(branch2);

    console.log(
      `Found ${branch1Students.length} students from branch1 and ${branch2Students.length} students from branch2`
    );

    // Get the classroom details
    const { data: classroom, error: classroomError } = await supabase
      .from("classrooms")
      .select("*")
      .eq("id", classroomId)
      .single();

    if (classroomError) throw new Error(classroomError.message);
    if (!classroom) throw new Error("Classroom not found");

    // Determine how many benches to use (minimum of classroom capacity or MAX_BENCHES_PER_CLASSROOM)
    const numberOfBenches = Math.min(
      MAX_BENCHES_PER_CLASSROOM,
      Math.floor(classroom.capacity / 2)
    );

    // Create seating assignments
    const seatingArrangements = [];

    // Create arrangements for each bench row
    for (let benchRow = 1; benchRow <= numberOfBenches; benchRow++) {
      // Get students for this bench
      const leftStudentIndex = benchRow - 1;
      const rightStudentIndex = benchRow - 1;

      // Check if we have enough students for this bench
      const leftStudent = branch1Students[leftStudentIndex];
      const rightStudent = branch2Students[rightStudentIndex];

      // Only create a bench if we have at least one student for it
      if (leftStudent || rightStudent) {
        seatingArrangements.push({
          exam_id: examId,
          classroom_id: classroomId,
          bench_row: benchRow,
          left: leftStudent?.id || null,
          right: rightStudent?.id || null,
        });
      }
    }

    // Insert the arrangements into the database
    if (seatingArrangements.length > 0) {
      const { data, error } = await supabase
        .from("seating_arrangement")
        .insert(seatingArrangements);

      if (error) throw new Error(error.message);
    }

    // Update the exam with the classroom_id
    await adminService.updateExam(examId, { classroom_id: classroomId });

    return {
      success: true,
      message: `Created ${seatingArrangements.length} bench arrangements`,
    };
  } catch (error) {
    console.error("Error in generateSeatingArrangement:", error);
    throw error;
  }
};

export default generateSeatingArrangement;
