import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Store user role in Firestore
 * @param {string} userId - Firebase user ID
 * @param {string} role - User role ('admin' or 'user')
 * @param {object} userData - Additional user data
 */
export const createUserProfile = async (userId, role, userData = {}) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      role,
      email: userData.email || "",
      displayName: userData.displayName || "",
      photoURL: userData.photoURL || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error creating user profile:", error);
    
    // Provide more helpful error messages
    if (error.code === "permission-denied") {
      throw new Error("Permission denied: Please check Firestore security rules. Make sure the rules allow users to create documents with their own userId.");
    } else if (error.code === "unavailable") {
      throw new Error("Firestore is unavailable. Please check your internet connection and Firebase configuration.");
    } else if (error.code === "unauthenticated") {
      throw new Error("User is not authenticated. Please sign in first.");
    }
    
    throw error;
  }
};

/**
 * Get user role from Firestore
 * @param {string} userId - Firebase user ID
 * @returns {Promise<{role: string, data: object}>} User role and data
 */
export const getUserRole = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return {
        role: userSnap.data().role || "user",
        data: userSnap.data(),
      };
    } else {
      // User doesn't exist in database, return default role
      return {
        role: "user",
        data: null,
      };
    }
  } catch (error) {
    console.error("Error getting user role:", error);
    
    // Provide more helpful error messages
    if (error.code === "permission-denied") {
      console.warn("Permission denied reading user role. This might be a security rules issue.");
      // Return default role instead of throwing, so the app can continue
      return {
        role: "user",
        data: null,
      };
    } else if (error.code === "unavailable") {
      console.warn("Firestore is unavailable. Using default role.");
      return {
        role: "user",
        data: null,
      };
    }
    
    // For other errors, return default role instead of crashing
    return {
      role: "user",
      data: null,
    };
  }
};

/**
 * Verify if user has the required role
 * @param {string} userId - Firebase user ID
 * @param {string} requiredRole - Required role ('admin' or 'user')
 * @returns {Promise<boolean>} True if user has the required role
 */
export const verifyUserRole = async (userId, requiredRole) => {
  try {
    const { role } = await getUserRole(userId);
    return role === requiredRole;
  } catch (error) {
    console.error("Error verifying user role:", error);
    return false;
  }
};

/**
 * Update user role
 * @param {string} userId - Firebase user ID
 * @param {string} role - New role ('admin' or 'user')
 */
export const updateUserRole = async (userId, role) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      role,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

