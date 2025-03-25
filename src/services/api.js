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

//student api
const getExams = async () => {
  const { data, error } = await supabase.from("exams").select("*");
  if (error) throw new Error(error.message);
  return data;
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
  const { data, error } = await supabase
    .from("invigilation_duties")
    .select("*");
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

export const authService = {
  login,
  logout,
};

export const studentService = {
  getExams,
  getSeatingArrangement,
};

export const facultyService = {
  inputAvailableDates,
  getInvigilationDuties,
  addExam,
  addSeatingArrangement,
  addInvigilationDuty,
};

export const adminService = {
  addUser,
};
