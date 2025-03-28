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
      .select("id, classname, capacity, bench_count")
      .eq("id", classroomId)
      .single();

    if (classroomError)
      throw new Error(`Failed to fetch classroom: ${classroomError.message}`);
    if (!classroom)
      throw new Error(`Classroom with ID ${classroomId} not found`);

    // Fetch students from branch1 for examId1
    const { data: branch1Students, error: branch1Error } = await supabase
      .from("users")
      .select("id, name, university_no, branch, year, sem")
      .eq("branch", branch1)
      .eq("role", "student")
      // Assuming there's a separate table or field to match students with exams
      // You might need to adjust this logic based on your actual schema

    if (branch1Error)
      throw new Error(
        `Failed to fetch students from branch ${branch1}: ${branch1Error.message}`
      );

    // Fetch students from branch2 for examId2
    const { data: branch2Students, error: branch2Error } = await supabase
      .from("users")
      .select("id, name, university_no, branch, year, sem")
      .eq("branch", branch2)
      .eq("role", "student")

    if (branch2Error)
      throw new Error(
        `Failed to fetch students from branch ${branch2}: ${branch2Error.message}`
      );

    // Fetch branch names
    const { data: branches, error: branchError } = await supabase
      .from("branch")
      .select("id, name")
      .in("id", [branch1, branch2]);

    if (branchError)
      throw new Error(
        `Failed to fetch branch information: ${branchError.message}`
      );

    // Create a map for easy branch name lookup
    const branchMap = branches.reduce((map, branch) => {
      map[branch.id] = branch.name;
      return map;
    }, {});

    // Generate seating arrangement based on classroom bench count
    const seatingArrangement = [];
    const totalBenches =
      classroom.bench_count || Math.floor(classroom.capacity / 2);

    for (let i = 0; i < totalBenches; i++) {
      const leftStudentIndex = i % branch1Students.length;
      const rightStudentIndex = i % branch2Students.length;

      const leftStudent = branch1Students[leftStudentIndex];
      const rightStudent = branch2Students[rightStudentIndex];

      seatingArrangement.push({
        bench_row: i + 1,
        left_student: {
          branch: branch1,
          branch_name: branchMap[branch1] || `Branch ${branch1}`,
          university_no: leftStudent?.university_no || null,
        },
        right_student: {
          branch: branch2,
          branch_name: branchMap[branch2] || `Branch ${branch2}`,
          university_no: rightStudent?.university_no || null,
        },
      });
    }

    return {
      classroom: classroomName || classroom.classname,
      classroom_id: classroomId,
      exam_id_1: examId1,
      exam_id_2: examId2,
      seating: seatingArrangement,
    };
  } catch (error) {
    console.error("Error generating seating arrangement:", error);
    throw error;
  }
};
