import api from "./api";

/**
 * User API service
 * Handles all user-related API calls
 */

// Register user with backend after Firebase authentication
export const registerUser = async (userData) => {
  const { firebaseUid, email, name, role, phone } = userData;
  const response = await api.post("/users/register", {
    firebaseUid,
    email,
    name,
    role,
    phone,
  });
  return response.data;
};

// Login user with backend using Firebase token
export const loginUser = async (firebaseToken) => {
  const response = await api.post("/users/login", {
    token: firebaseToken,
  });
  return response.data;
};

// Google login with backend
export const googleLogin = async (firebaseToken) => {
  const response = await api.post("/users/google-login", {
    token: firebaseToken,
  });
  return response.data;
};

// Logout user
export const logoutUser = async () => {
  const response = await api.post("/users/logout");
  return response.data;
};

// Get user profile
export const getUserProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

// Reset password
export const resetPassword = async (currentPassword, newPassword) => {
  const response = await api.post("/users/reset-password", {
    currentPassword,
    newPassword,
  });
  return response.data;
};

// Forgot password
export const forgotPassword = async (email) => {
  const response = await api.post("/users/forgot-password", {
    email,
  });
  return response.data;
};

// Update user details - Note: This endpoint may need to be added to backend routes
export const updateUserDetails = async (name, phone) => {
  const response = await api.patch("/users/update", {
    name,
    phone,
  });
  return response.data;
};

