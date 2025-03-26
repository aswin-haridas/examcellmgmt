import supabase from "../lib/supabase";

//auth
const login = async (email, password) => {
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("password", password);

  if (error) throw new Error(error.message);
  if (!users || users.length === 0) throw new Error("Invalid credentials");

  const user = users[0];
  localStorage.setItem("role", user.role);
  localStorage.setItem("user", JSON.stringify(user));

  return user;
};

const logout = async () => {
  localStorage.removeItem("role");
  localStorage.removeItem("user");
  // No need to reload here, navigation will happen after logout
  return true;
};

// Change password
const changePassword = async (userId, currentPassword, newPassword) => {
  // First verify the current password
  const { data: users, error: verifyError } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .eq("password", currentPassword);

  if (verifyError) throw new Error(verifyError.message);
  if (!users || users.length === 0)
    throw new Error("Current password is incorrect");

  // Update with new password
  const { error: updateError } = await supabase
    .from("users")
    .update({ password: newPassword })
    .eq("id", userId);

  if (updateError) throw new Error(updateError.message);
  return true;
};

//student api
const getExams = async () => {
  const { data, error } = await supabase
    .from("exams")
    .select("*, classrooms(*)")
    .order("date", { ascending: true });
  if (error) throw new Error(error.message);

  if (!data) return []; // Return an empty array if data is null or undefined

  return data.map((exam) => ({
    ...exam,
    classname: exam.classrooms?.classname ?? "TBD", // Extract classname or default to "TBD"
  }));
};

const getSeatingArrangement = async (examId) => {
  const { data, error } = await supabase
    .from("seating_arrangement")
    .select("*")
    .eq("exam_id", examId);
  if (error) throw new Error(error.message);
  return data;
};

//faculty api
const inputAvailableDates = async (dates) => {
  const { data, error } = await supabase.from("available_dates").insert(dates);
  if (error) throw new Error(error.message);
  return data;
};

const getInvigilationDuties = async () => {
  // Get the current user
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("invigilation_duties")
    .select("*, exams(*), classrooms(*)")
    .eq("faculty_id", user.id);

  if (error) throw new Error(error.message);

  return data
    ? data.map((duty) => ({
        id: duty.id,
        exam_id: duty.exam_id,
        exam_name: duty.exams?.subject || "Unknown Exam",
        date: duty.exams?.date,
        time: duty.exams?.time,
        venue: duty.exams?.classrooms?.classname || "TBD",
      }))
    : [];
};

const getAllFacultyAvailability = async () => {
  const { data, error } = await supabase
    .from("available_dates")
    .select("*, users!inner(id, name)")
    .eq("users.role", "faculty");

  if (error) throw new Error(error.message);

  return data
    ? data.map((item) => ({
        faculty_id: item.faculty_id,
        faculty_name: item.users?.name || "Unknown Faculty",
        date: item.date,
        status: item.status,
      }))
    : [];
};

const getClassroomDetails = async (classroomId = null) => {
  let query = supabase.from("classrooms").select("*");

  if (classroomId) {
    query = query.eq("id", classroomId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

const getStudentListByExam = async (examId) => {
  const { data, error } = await supabase
    .from("student_exams")
    .select("*, users!inner(*)")
    .eq("exam_id", examId);

  if (error) throw new Error(error.message);
  return data;
};

//faculty

const addUser = async (user) => {
  const { data, error } = await supabase.from("users").insert(user);
  if (error) throw new Error(error.message);
  return data;
};

const addExam = async (exam) => {
  const { data, error } = await supabase.from("exams").insert(exam);
  if (error) throw new Error(error.message);
  return data;
};

const addSeatingArrangement = async (seatingArrangement) => {
  const { data, error } = await supabase
    .from("seating_arrangement")
    .insert(seatingArrangement);
  if (error) throw new Error(error.message);
  return data;
};

const addInvigilationDuty = async (invigilationDuty) => {
  const { data, error } = await supabase
    .from("invigilation_duties")
    .insert(invigilationDuty);
  if (error) throw new Error(error.message);
  return data;
};

// Automatically assign invigilation duties based on availability
const assignInvigilationDuties = async (examId) => {
  try {
    // Get the exam details first
    const { data: examData, error: examError } = await supabase
      .from("exams")
      .select("*")
      .eq("id", examId)
      .single();

    if (examError) throw new Error(examError.message);
    if (!examData) throw new Error("Exam not found");

    // Get faculty available on the exam date
    const { data: availableFaculty, error: availabilityError } = await supabase
      .from("available_dates")
      .select("*, users!inner(*)")
      .eq("date", examData.date)
      .eq("status", "available")
      .eq("users.role", "faculty");

    if (availabilityError) throw new Error(availabilityError.message);
    if (!availableFaculty || availableFaculty.length === 0) {
      throw new Error("No faculty available for this date");
    }

    // Randomly select a faculty member
    const randomIndex = Math.floor(Math.random() * availableFaculty.length);
    const selectedFaculty = availableFaculty[randomIndex];

    // Create the invigilation duty
    const invigilationDuty = {
      exam_id: examId,
      faculty_id: selectedFaculty.faculty_id,
      assigned_date: new Date().toISOString(),
      status: "assigned",
    };

    return await addInvigilationDuty(invigilationDuty);
  } catch (error) {
    throw error;
  }
};

//admin api
const getAllUsers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const updateUser = async (userId, userData) => {
  const { data, error } = await supabase
    .from("users")
    .update(userData)
    .eq("id", userId);

  if (error) throw new Error(error.message);
  return data;
};

const deleteUser = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .delete()
    .eq("id", userId);

  if (error) throw new Error(error.message);
  return data;
};

const getAllClassrooms = async () => {
  const { data, error } = await supabase
    .from("classrooms")
    .select("*")
    .order("classname", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

const getClassroomById = async (classroomId) => {
  const { data, error } = await supabase
    .from("classrooms")
    .select("*")
    .eq("id", classroomId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const addClassroom = async (classroom) => {
  const { data, error } = await supabase.from("classrooms").insert(classroom);

  if (error) throw new Error(error.message);
  return data;
};

const updateClassroom = async (classroomId, classroomData) => {
  const { data, error } = await supabase
    .from("classrooms")
    .update(classroomData)
    .eq("id", classroomId);

  if (error) throw new Error(error.message);
  return data;
};

const deleteClassroom = async (classroomId) => {
  const { data, error } = await supabase
    .from("classrooms")
    .delete()
    .eq("id", classroomId);

  if (error) throw new Error(error.message);
  return data;
};

const getAllExams = async () => {
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .order("date", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

const getAllBranches = async () => {
  const { data, error } = await supabase.from("branches").select("*");

  if (error) throw new Error(error.message);
  return data;
};


const getExamById = async (examId) => {
  const { data, error } = await supabase
    .from("exams")
    .select("*, classrooms(*)")
    .eq("id", examId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const updateExam = async (examId, examData) => {
  const { data, error } = await supabase
    .from("exams")
    .update(examData)
    .eq("id", examId);

  if (error) throw new Error(error.message);
  return data;
};

const deleteExam = async (examId) => {
  const { data, error } = await supabase
    .from("exams")
    .delete()
    .eq("id", examId);

  if (error) throw new Error(error.message);
  return data;
};

const getSeatingArrangementByExam = async (examId) => {
  const { data, error } = await supabase
    .from("seating_arrangement")
    .select("*, users(*)")
    .eq("exam_id", examId);

  if (error) throw new Error(error.message);
  return data;
};

const updateSeatingArrangement = async (seatingId, seatingData) => {
  const { data, error } = await supabase
    .from("seating_arrangement")
    .update(seatingData)
    .eq("id", seatingId);

  if (error) throw new Error(error.message);
  return data;
};

const deleteSeatingArrangement = async (seatingId) => {
  const { data, error } = await supabase
    .from("seating_arrangement")
    .delete()
    .eq("id", seatingId);

  if (error) throw new Error(error.message);
  return data;
};

const getEligibleStudentsForExam = async (examId) => {
  // Get students registered for this exam or in the relevant course
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "student");

  if (error) throw new Error(error.message);
  return data;
};

const getAllInvigilationDuties = async () => {
  const { data, error } = await supabase
    .from("invigilation_duties")
    .select("*, exams(*), users!faculty_id(*), classrooms(*)");

  if (error) throw new Error(error.message);
  return data;
};

export const authService = {
  login,
  logout,
  changePassword,
};

export const studentService = {
  getExams,
  getSeatingArrangement,
};

export const facultyService = {
  inputAvailableDates,
  getInvigilationDuties,
  getAllFacultyAvailability,
  getClassroomDetails,
  getStudentListByExam,
  addExam,
  addSeatingArrangement,
  addInvigilationDuty,
};

export const adminService = {
  // User management
  addUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,

  // Classroom management
  getAllClassrooms,
  getClassroomById, // Add this function to the exports
  addClassroom,
  updateClassroom,
  deleteClassroom,

  // Exam management
  getAllExams,
  getExamById,
  addExam,
  updateExam,
  deleteExam,
  getAllBranches,

  // Seating management
  getSeatingArrangementByExam,
  addSeatingArrangement,
  updateSeatingArrangement,
  deleteSeatingArrangement,
  getEligibleStudentsForExam,
  generateSeatingArrangement, // Add the new function

  // Invigilation management
  getAllInvigilationDuties,
  assignInvigilationDuties,

  // Admin can use these as well
  addInvigilationDuty,
};
