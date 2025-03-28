import { useState, useEffect } from "react";

export default function whoIsThis() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get role from localStorage
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  return userRole;
}
