import { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile
}
from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { googleLogin, loginUser, registerUser as registerUserApi, getUserProfile, logoutUser } from "../services/userApi";
import { clearAllComparisonStorage } from "./ComparisonContext";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          // Try to login to backend first (this will create user if doesn't exist)
          const response = await loginUser(token);
          if (response && response.data && response.data.user) {
            setUserRole(response.data.user.role);
          } else {
            setUserRole("visitor");
          }
        } catch (error) {
          console.error("Error fetching user profile from backend:", error);
          // Check if it's a backend connection error vs auth error
          if (error.response?.status === 401) {
            console.warn("Backend authentication failed. Token may be invalid or expired.");
          }
          setUserRole("visitor"); // Default to visitor role on error
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (role) => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const token = await user.getIdToken();
    const response = await googleLogin(token, role);
    if (response && response.data && response.data.user) {
      setUserRole(response.data.user.role);
      return {
        user,
      };
    } else {
      setUserRole("user");
      return {
        user,
      };
    }
  };

  const signInWithEmailPassword = async (email, password, role) => {
    try {
      console.log("Attempting to sign in with email:", email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      console.log("Firebase signin successful, UID:", user.uid);
      const token = await user.getIdToken();
      const response = await loginUser(token, role);
      if (response && response.data && response.data.user) {
        setUserRole(response.data.user.role);
        return {
          user,
        };
      } else {
        setUserRole("user");
        return {
          user,
        };
      }
    } catch (error) {
      console.error("Email/password signin error:", error);
      if (error.code === "auth/user-not-found") {
        throw new Error("Email not found. Please check your email or register a new account.");
      } else if (error.code === "auth/invalid-password" || error.code === "auth/invalid-credential") {
        throw new Error("Invalid email or password. Please try again.");
      } else if (error.code === "auth/too-many-requests") {
        throw new Error("Too many login attempts. Please try again later.");
      } else {
        throw error;
      }
    }
  };


  const registerWithEmailPassword = async (email, password, name, role, phone) => {
    let firebaseUser = null;
    try {
      if (email === import.meta.env.VITE_ADMIN_EMAIL) {
        throw new Error("Registration for the admin account is not allowed. Please login instead.");
      }

      // Check if Firebase account already exists (from previous failed attempt)
      let result;
      try {
        console.log("Attempting to create Firebase account for:", email);
        result = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUser = result.user;
        console.log("✓ New Firebase account created:", firebaseUser.uid);
      } catch (firebaseError) {
        if (firebaseError.code === "auth/email-already-in-use") {
          // Firebase account exists - try to sign in to get the user
          console.log("Firebase account already exists for email:", email);
          try {
            result = await signInWithEmailAndPassword(auth, email, password);
            firebaseUser = result.user;
            console.log("✓ Signed in to existing Firebase account:", firebaseUser.uid);
          } catch (signInError) {
            throw new Error("Account exists but password is incorrect. Please use the correct password or reset your password.");
          }
        } else if (firebaseError.code === "auth/weak-password") {
          throw new Error("Password is too weak. Please use at least 6 characters with a mix of letters and numbers.");
        } else if (firebaseError.code === "auth/invalid-email") {
          throw new Error("Invalid email address. Please check and try again.");
        } else {
          throw firebaseError;
        }
      }

      if (!firebaseUser) {
        throw new Error("Failed to create or access Firebase account");
      }

      // Update Firebase profile with name
      if (name) {
        try {
          await updateFirebaseProfile(firebaseUser, { displayName: name });
          console.log("✓ Firebase profile updated with name");
        } catch (updateError) {
          console.warn("Failed to update Firebase profile:", updateError);
          // Don't fail registration if profile update fails
        }
      }
      
      // Register with backend
      console.log("Attempting backend registration for:", email);
      try {
        const response = await registerUserApi({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          name: name || firebaseUser.email,
          role: role,
          phone: phone
        });

        console.log("✓ Backend registration successful");
        if (response && response.data) {
          setUserRole(response.data.role);
        } else {
          setUserRole("visitor");
        }
      } catch (backendError) {
        // If backend registration fails, delete the Firebase user to allow retry
        console.error("✗ Backend registration failed:", backendError.message);
        try {
          await firebaseUser.delete();
          console.log("✓ Firebase account deleted due to backend registration failure");
        } catch (deleteError) {
          console.error("✗ Failed to delete Firebase account after backend failure:", deleteError);
          // Even if we can't delete, we should throw the backend error
        }
        throw backendError;
      }
      
      console.log("✓ Registration complete");
      return firebaseUser;
    } catch (error) {
      console.error("✗ Registration error:", error.message || error);
      throw error;
    }
  };


  const signOut = async () => {
    try {
      // Call backend logout API to revoke refresh tokens
      const token = currentUser ? await currentUser.getIdToken() : null;
      if (token) {
        try {
          await logoutUser();
        } catch (error) {
          console.error("Error calling backend logout:", error);
        }
      }
      
      // Clear all comparison data from localStorage
      clearAllComparisonStorage();
      
      // Sign out from Firebase
      await firebaseSignOut(auth);
      setUserRole(null);

    } 
    
    catch (error) {
      console.error("Error during sign out:", error);
      // Still clear comparison storage and sign out even if there's an error
      clearAllComparisonStorage();
      await firebaseSignOut(auth);
      setUserRole(null);
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    if (!currentUser) return;
    
    try {
      const token = await currentUser.getIdToken();
      const response = await loginUser(token);
      if (response && response.data && response.data.user) {
        setUserRole(response.data.user.role);
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    }
  };

  const value = {
    currentUser,
    userRole,
    signInWithGoogle,
    signInWithEmailPassword,
    registerWithEmailPassword,
    signOut,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

