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
          setUserRole("visitor"); // Default to visitor role on error
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const token = await user.getIdToken();
    const response = await googleLogin(token);
    if (response && response.data && response.data.user) {
      setUserRole(response.data.user.role);
    } else {
      setUserRole("visitor");
    }
    return user;
  };

  const signInWithEmailPassword = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    const token = await user.getIdToken();
    const response = await loginUser(token);
    if (response && response.data && response.data.user) {
      setUserRole(response.data.user.role);
    } else {
      setUserRole("visitor");
    }
    return user;
  };


  const registerWithEmailPassword = async (email, password, name, role, phone) => {
    if (email === import.meta.env.VITE_ADMIN_EMAIL) {
      throw new Error("Registration for the admin account is not allowed. Please login instead.");
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    if (name) {
      await updateFirebaseProfile(user, { displayName: name });
    }
    
    const token = await user.getIdToken();
    const response = await registerUserApi({
      firebaseUid: user.uid,
      email: user.email,
      name: name || user.email,
      role: role,
      phone: phone
    });

    if (response && response.data) {
      setUserRole(response.data.role);
    } else {
      setUserRole("visitor");
    }
    return user;
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

  const value = {
    currentUser,
    userRole,
    signInWithGoogle,
    signInWithEmailPassword,
    registerWithEmailPassword,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

