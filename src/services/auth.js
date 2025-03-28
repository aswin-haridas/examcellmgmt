import supabase from "../lib/supabase";

//auth
export const login = async (email, password) => {
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("password", password);

  const user = users[0];
  localStorage.setItem("role", user.role);
  localStorage.setItem("user", JSON.stringify(user));
  return user;
};

export const logout = async () => {
  localStorage.clear();
  return true;
};
