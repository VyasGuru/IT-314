import api from "./api";

/**
 * User API service
 * Handles all user-related API calls
 */

// Register user with backend after Firebase authentication
export const registerUser = async (userData) => {
  const { firebaseUid, email, name, role, phone } = userData;
  const payload = {
    firebaseUid,
    email,
    name,
    role,
  };
  
  // Only include phone if provided and not just whitespace
  if (phone && phone.trim().length > 0) {
    payload.phone = phone.trim();
  }
  
  console.log("=== REGISTRATION PAYLOAD ===");
  console.log("Raw input:", userData);
  console.log("Payload being sent:", JSON.stringify(payload, null, 2));
  console.log("Endpoint: /users/register");
  console.log("============================");
  
  const response = await api.post("/users/register", payload);
  return response.data;
};

// Login user with backend using Firebase token
export const loginUser = async (firebaseToken, role = "user") => {
  const response = await api.post("/users/login", {
    token: firebaseToken,
    role,
  });
  return response.data;
};

// Google login with backend
export const googleLogin = async (firebaseToken, role = "user") => {
  const response = await api.post("/users/google-login", {
    token: firebaseToken,
    role,
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

// Update user details - supports photo upload
export const updateUserDetails = async (name, phone, photoFile = null) => {
  const formData = new FormData();
  
  if (name) {
    formData.append("name", name);
  }
  
  if (phone) {
    formData.append("phone", phone);
  }
  
  if (photoFile) {
    formData.append("photo", photoFile);
  }

  const response = await api.patch("/users/update", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};