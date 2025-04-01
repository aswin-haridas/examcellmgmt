export default function useVerifyUser() {
  // Get user details from sessionStorage
  const role = sessionStorage.getItem("role");

  return role;
}
