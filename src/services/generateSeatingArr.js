import supabase from "../lib/supabase";

export const generateSeatingArr = async (
  examId1,
  examId2,
  classroomId,
  branch1,
  branch2
) => {
  try {
    // Fetch students for exam 1
    const { data: exam1Students, error: error1 } = await supabase
      .from("exam_registrations")
      .select("student_id, students(university_no, branch_name, branch_code)")
      .eq("exam_id", examId1);

    if (error1)
      throw new Error(`Failed to fetch exam 1 students: ${error1.message}`);

    // Fetch students for exam 2
    const { data: exam2Students, error: error2 } = await supabase
      .from("exam_registrations")
      .select("student_id, students(university_no, branch_name, branch_code)")
      .eq("exam_id", examId2);

    if (error2)
      throw new Error(`Failed to fetch exam 2 students: ${error2.message}`);

    // Process students from both exams
    const students1 = exam1Students.map((reg) => ({
      university_no: reg.students.university_no,
      branch_name: reg.students.branch_name,
      branch: reg.students.branch_code,
    }));

    const students2 = exam2Students.map((reg) => ({
      university_no: reg.students.university_no,
      branch_name: reg.students.branch_name,
      branch: reg.students.branch_code,
    }));

    // Create seating arrangement with alternating students
    const totalBenches = 15; // Match the value in Class.jsx
    const seatingArr = [];

    for (let i = 0; i < totalBenches; i++) {
      // For each bench, allocate a student from each branch
      const leftStudent = students1[i] || null;
      const rightStudent = students2[i] || null;

      seatingArr.push({
        bench_row: i + 1,
        left_student: leftStudent,
        right_student: rightStudent,
      });
    }

    // Store the seating arrangement in Supabase
    const { data, error } = await supabase
      .from("classroom_seating")
      .upsert(
        {
          classroom_id: classroomId,
          seating_data: seatingArr,
          exam1_id: examId1,
          exam2_id: examId2,
          branch1_code: branch1,
          branch2_code: branch2,
        },
        { onConflict: "classroom_id" }
      )
      .select();

    if (error)
      throw new Error(`Failed to store seating arrangement: ${error.message}`);

    return {
      success: true,
      data: seatingArr,
      message: `Successfully created seating arrangement for ${branch1} and ${branch2}`,
    };
  } catch (error) {
    console.error("Seating arrangement generation error:", error);
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }
};
