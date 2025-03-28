export default function useVerifyUser() {
  // Get user details from localStorage
  const role = localStorage.getItem("role");

  return role;
}
