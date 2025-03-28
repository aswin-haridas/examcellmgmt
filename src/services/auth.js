import supabase from "./supabase";

//auth
export const login = async (email, password) => {
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("password", password);

  if (error || !users || users.length === 0) {
    throw new Error("Invalid login credentials");
  }

  const user = users[0];
  localStorage.setItem("role", user.role);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("loggedIn", "true");
  return user;
};

export const logout = async () => {
  localStorage.clear();
  window.location.href = "/"; // Force redirect to login page
  return true;
};
