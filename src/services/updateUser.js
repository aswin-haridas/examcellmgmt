import supabase from "./supabase";

/**
 * Update user details in the database
 * @param {string} userId - The user ID to update
 * @param {object} formData - Object containing user properties to update
 * @returns {object} - Response object with success flag, data and error
 */
const updateUserDetails = async (userId, formData) => {
  try {
    // Create a copy of form data for updates
    const updates = { ...formData };

    // Handle password separately
    const password = updates.password;
    delete updates.password; // Remove from regular updates

    // First update user details in users table
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId);

    if (error) throw error;

    // If a password was provided, update it
    if (password && password.trim() !== "") {
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: password }
      );

      if (authError) {
        console.error("Failed to update password:", authError);
        return {
          success: false,
          data: null,
          error: `User details updated but password change failed: ${authError.message}`,
        };
      }
    }

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    console.error("Error in updateUserDetails:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Unknown error occurred",
    };
  }
};

export default updateUserDetails;
