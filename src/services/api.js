import supabase from "../lib/supabase";

//auth
const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  return data.user;
};

const login = async (email, password, role) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);

  // Store role in local storage for session management
  localStorage.setItem("userRole", role);
  return data.user;
};

const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);

  // Clear role from local storage
  localStorage.removeItem("userRole");
  return true;
};

export const authService = {
  signUp,
  login,
  logout,
};
