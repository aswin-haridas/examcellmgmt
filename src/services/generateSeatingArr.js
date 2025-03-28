import supabase from "./supabase";

export const generateSeatingArr = async ({
  branch1,
  branch2,
  examId1,
  examId2,
  classroomId,
  classroomName,
}) => {
  /// Log form data for debugging
  console.log("Generating seating arrangement with data:", {
    branch1,
    branch2,
    examId1,
    examId2,
    classroomId,
    classroomName,
  });

  try {
    // Fetch classroom details from Supabase
    const { data: classroom, error: classroomError } = await supabase
      .from("classrooms")
      .select("id, classname, capacity, bench_count, allocated_students")
      .eq("id", classroomId)
      .single();

    if (classroomError)
      throw new Error(`Failed to fetch classroom: ${classroomError.message}`);
    if (!classroom)
      throw new Error(`Classroom with ID ${classroomId} not found`);

    // Fetch all allocated students across all classrooms to avoid selecting them again
    const { data: classrooms, error: allClassroomsError } = await supabase
      .from("classrooms")
      .select("allocated_students");

    if (allClassroomsError)
      throw new Error(
        `Failed to fetch classrooms: ${allClassroomsError.message}`
      );

    // Combine all allocated student IDs from all classrooms
    let alreadyAllocatedStudentIds = [];
    classrooms.forEach((room) => {
      if (room.allocated_students && Array.isArray(room.allocated_students)) {
        alreadyAllocatedStudentIds = [
          ...alreadyAllocatedStudentIds,
          ...room.allocated_students,
        ];
      }
    });

    console.log(
      `Found ${alreadyAllocatedStudentIds.length} already allocated students across all classrooms`
    );

    // Base query for branch1 students
    let query1 = supabase
      .from("users")
      .select("id, name, university_no, branch, year, sem")
      .eq("branch", branch1)
      .eq("role", "student")
      .order("university_no", { ascending: true })
      .limit(18);

    // Base query for branch2 students
    let query2 = supabase
      .from("users")
      .select("id, name, university_no, branch, year, sem")
      .eq("branch", branch2)
      .eq("role", "student")
      .order("university_no", { ascending: true })
      .limit(18);

    // Only add the NOT IN clause if there are already allocated students
    if (alreadyAllocatedStudentIds.length > 0) {
      query1 = query1.not(
        "id",
        "in",
        `(${alreadyAllocatedStudentIds.join(",")})`
      );
      query2 = query2.not(
        "id",
        "in",
        `(${alreadyAllocatedStudentIds.join(",")})`
      );
    }

    // Execute the queries
    const [
      { data: branch1Students, error: branch1Error },
      { data: branch2Students, error: branch2Error },
    ] = await Promise.all([query1, query2]);

    if (branch1Error)
      throw new Error(
        `Failed to fetch students from branch ${branch1}: ${branch1Error.message}`
      );

    if (branch2Error)
      throw new Error(
        `Failed to fetch students from branch ${branch2}: ${branch2Error.message}`
      );

    // Check if we have enough students
    if (branch1Students.length === 0 || branch2Students.length === 0) {
      throw new Error(
        `Not enough students available: ${branch1Students.length} from ${branch1} and ${branch2Students.length} from ${branch2}`
      );
    }

    console.log(
      `Found ${branch1Students.length} available students from ${branch1} and ${branch2Students.length} from ${branch2}`
    );

    // Create a proper branch mapping using the branch codes from parameters
    const branchMap = {
      CSE: "Computer Science Engineering",
      ECE: "Electronics & Communication Engineering",
    };

    // Generate seating arrangement based on classroom bench count
    const seatingArrangement = [];
    const maxStudents = Math.min(
      branch1Students.length,
      branch2Students.length
    );
    const totalBenches = Math.min(
      classroom.bench_count || Math.floor(classroom.capacity / 2),
      maxStudents
    );

    // Create arrays to track which students are being allocated
    const allocatedStudents = [];

    for (let i = 0; i < totalBenches; i++) {
      const leftStudent = branch1Students[i];
      const rightStudent = branch2Students[i];

      // Add students to the allocated list
      allocatedStudents.push(leftStudent.id, rightStudent.id);

      seatingArrangement.push({
        bench_row: i + 1,
        left_student: {
          id: leftStudent.id,
          name: leftStudent.name,
          branch: branch1,
          branch_name: branchMap[branch1] || branch1,
          university_no: leftStudent?.university_no || null,
        },
        right_student: {
          id: rightStudent.id,
          name: rightStudent.name,
          branch: branch2,
          branch_name: branchMap[branch2] || branch2,
          university_no: rightStudent?.university_no || null,
        },
      });
    }

    // Update the allocated_student column in classrooms table
    const { error: updateError } = await supabase
      .from("classrooms")
      .update({ allocated_students: allocatedStudents })
      .eq("id", classroomId);

    if (updateError) {
      throw new Error(
        `Failed to update classroom allocation: ${updateError.message}`
      );
    }

    // Check if seating arrangement already exists for this classroom
    const { data: existingSeating, error: existingSeatingError } =
      await supabase
        .from("classroom_seating")
        .select("*")
        .eq("classroom_id", classroomId);

    if (existingSeatingError) {
      throw new Error(
        `Failed to check existing seating: ${existingSeatingError.message}`
      );
    }

    // Save the seating arrangement to classroom_seating table
    let seatingError;
    if (existingSeating && existingSeating.length > 0) {
      // Update existing seating arrangement
      const { error } = await supabase
        .from("classroom_seating")
        .update({
          seating_data: seatingArrangement,
          updated_at: new Date().toISOString(),
        })
        .eq("classroom_id", classroomId);
      seatingError = error;
    } else {
      // Insert new seating arrangement
      const { error } = await supabase.from("classroom_seating").insert({
        classroom_id: classroomId,
        seating_data: seatingArrangement,
      });
      seatingError = error;
    }

    if (seatingError) {
      throw new Error(
        `Failed to save seating arrangement: ${seatingError.message}`
      );
    }

    return {
      success: true,
      data: {
        classroom: classroomName || classroom.classname,
        classroom_id: classroomId,
        exam_id_1: examId1,
        exam_id_2: examId2,
        total_students_allocated: allocatedStudents.length,
        seating_data: seatingArrangement, // Changed from 'seating' to match the table column name
      },
    };
  } catch (error) {
    console.error("Error generating seating arrangement:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};
