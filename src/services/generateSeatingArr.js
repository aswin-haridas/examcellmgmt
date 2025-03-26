// Add a new function to generate seating arrangements
const generateSeatingArrangement = async (examId, classroomId) => {
  try {
    // First get the eligible students for this exam
    const students = await getEligibleStudentsForExam(examId);

    // Get the classroom details
    const { data: classroom, error: classroomError } = await supabase
      .from("classrooms")
      .select("*")
      .eq("id", classroomId)
      .single();

    if (classroomError) throw new Error(classroomError.message);
    if (!classroom) throw new Error("Classroom not found");

    // Create seating assignments based on classroom capacity
    const capacity = classroom.capacity;
    const arrangements = [];

    // Only include students up to the capacity of the room
    const studentsToAssign = students.slice(0, capacity);

    // Create seating arrangement records
    for (let i = 0; i < studentsToAssign.length; i++) {
      arrangements.push({
        exam_id: examId,
        student_id: studentsToAssign[i].id,
        seat_number: i + 1,
        status: "assigned",
      });
    }

    // Insert the arrangements into the database
    const { data, error } = await supabase
      .from("seating_arrangement")
      .insert(arrangements);

    if (error) throw new Error(error.message);

    // Update the exam with the classroom_id
    await updateExam(examId, { classroom_id: classroomId });

    return data;
  } catch (error) {
    throw error;
  }
};

export default generateSeatingArrangement;
