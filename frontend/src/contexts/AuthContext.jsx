import { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  signInWithPopup
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { getUserRole, createUserProfile } from "../services/userService";
import { isAllowedAdminEmail } from "../config/adminEmails";
import { loginUser, googleLogin, registerUser as registerUserApi, getUserProfile } from "../services/userApi";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Set a timeout to ensure we don't block rendering forever
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 3000);

      const unsubscribe = onAuthStateChanged(
        auth, 
        async (user) => {
          clearTimeout(timeout);
          setCurrentUser(user);
          
          // Fetch user role from Firestore and sync with backend
          if (user) {
            try {
              const { role } = await getUserRole(user.uid);
              setUserRole(role);
              
              // Sync with backend - try to get user profile from backend
              try {
                const token = await user.getIdToken();
                // Try to login to backend first (this will create user if doesn't exist)
                try {
                  await googleLogin(token);
                } catch (loginError) {
                  // If login fails, user might not exist in backend, that's okay
                  console.log("Backend sync - user may not be registered in backend yet");
                }
                
                // Try to get user profile from backend to sync roles
                try {
                  const profileResponse = await getUserProfile();
                  if (profileResponse?.data?.role) {
                    // Backend role takes precedence
                    setUserRole(profileResponse.data.role);
                  }
                } catch (profileError) {
                  // Profile fetch failed, use Firestore role
                  console.log("Could not fetch backend profile, using Firestore role");
                }
              } catch (backendError) {
                console.error("Error syncing with backend:", backendError);
                // Continue with Firestore role if backend sync fails
              }
            } catch (error) {
              console.error("Error fetching user role:", error);
              setUserRole("user"); // Default to user role
            }
          } else {
            setUserRole(null);
          }
          
          setLoading(false);
        },
        (error) => {
          clearTimeout(timeout);
          console.error("Auth state change error:", error);
          setUserRole(null);
          setLoading(false);
        }
      );

      return () => {
        clearTimeout(timeout);
        unsubscribe();
      };
    } catch (error) {
      console.error("Error setting up auth listener:", error);
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async (role) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const { role: existingRole, data } = await getUserRole(user.uid);
      
      if (!data) {
        // New user - validate admin email if registering as admin
        if (role === "admin") {
          const normalizedEmail = user.email?.toLowerCase().trim();
          if (!normalizedEmail || !isAllowedAdminEmail(normalizedEmail)) {
            await firebaseSignOut(auth);
            throw new Error("Only authorized emails can register as administrators.");
          }
        }
        // Create profile with selected role in Firestore
        try {
          await createUserProfile(user.uid, role, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          });
        } catch (profileError) {
          console.error("Error creating user profile in Firestore:", profileError);
          if (profileError.message?.includes("Permission denied")) {
            await firebaseSignOut(auth);
            throw new Error("Failed to create user profile. Please check Firestore security rules are set up correctly.");
          }
          // Continue even if profile creation fails
          console.warn("User signed in but profile creation failed. Role will be set on next login.");
        }
        setUserRole(role);
        
        // Register user in backend
        try {
          const token = await user.getIdToken();
          await registerUserApi({
            firebaseUid: user.uid,
            email: user.email,
            name: user.displayName || user.email,
            role: role === "admin" ? "admin" : "visitor", // Map frontend roles to backend roles
          });
          // After registration, login to backend
          await googleLogin(token);
        } catch (backendError) {
          console.error("Error registering with backend:", backendError);
          // Continue even if backend registration fails
        }
      } else {
        // Existing user - verify role matches
        if (existingRole !== role) {
          await firebaseSignOut(auth);
          throw new Error(`This account is registered as ${existingRole}, not ${role}. Please select the correct role.`);
        }
        setUserRole(existingRole);
        
        // Login to backend
        try {
          const token = await user.getIdToken();
          await googleLogin(token);
          
          // Sync role from backend
          try {
            const profileResponse = await getUserProfile();
            if (profileResponse?.data?.role) {
              setUserRole(profileResponse.data.role);
            }
          } catch (profileError) {
            // Use Firestore role if backend profile fetch fails
            console.log("Could not fetch backend profile");
          }
        } catch (backendError) {
          console.error("Error syncing with backend:", backendError);
          // Continue with Firestore role if backend sync fails
        }
      }
      
      return user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signInWithEmailPassword = async (email, password, role) => {
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Verify user role matches
      const { role: userRole } = await getUserRole(user.uid);
      
      if (userRole !== role) {
        await firebaseSignOut(auth);
        throw new Error(`This account is registered as ${userRole}, not ${role}. Please select the correct role.`);
      }
      
      setUserRole(userRole);
      
      // Login to backend
      try {
        const token = await user.getIdToken();
        await loginUser(token);
        
        // Sync role from backend
        try {
          const profileResponse = await getUserProfile();
          if (profileResponse?.data?.role) {
            setUserRole(profileResponse.data.role);
          }
        } catch (profileError) {
          // Use Firestore role if backend profile fetch fails
          console.log("Could not fetch backend profile");
        }
      } catch (backendError) {
        console.error("Error syncing with backend:", backendError);
        // Continue with Firestore role if backend sync fails
      }
      
      return user;
    } catch (error) {
      console.error("Error signing in with email/password:", error);
      throw error;
    }
  };

  const registerWithEmailPassword = async (email, password, name, role) => {
    try {
      // Validate admin email before registration
      if (role === "admin") {
        const normalizedEmail = email.toLowerCase().trim();
        if (!isAllowedAdminEmail(normalizedEmail)) {
          const error = new Error("Only authorized emails can register as administrators.");
          error.code = "auth/unauthorized-admin";
          throw error;
        }
      }

      const { createUserWithEmailAndPassword, updateProfile: updateFirebaseProfile } = await import("firebase/auth");
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Update Firebase profile with display name
      if (name) {
        await updateFirebaseProfile(user, { displayName: name });
      }
      
      // Create user profile in Firestore with role
      try {
        await createUserProfile(user.uid, role, {
          email: user.email,
          displayName: name || user.email,
          photoURL: user.photoURL,
        });
      } catch (profileError) {
        console.error("Error creating user profile in Firestore:", profileError);
        // If profile creation fails, user is still authenticated
        // We'll set the role locally, but Firestore might not have it
        // This allows the user to continue, and the role will be set on next login
        if (profileError.message?.includes("Permission denied")) {
          throw new Error("Failed to create user profile. Please check Firestore security rules are set up correctly.");
        }
        // Don't throw for other errors, allow registration to succeed
        console.warn("User registered but profile creation failed. Role will be set on next login.");
      }
      
      setUserRole(role);
      
      // Register user in backend
      try {
        const token = await user.getIdToken();
        await registerUserApi({
          firebaseUid: user.uid,
          email: user.email,
          name: name || user.email,
          role: role === "admin" ? "admin" : "visitor", // Map frontend roles to backend roles
          phone: "", // Can be updated later
        });
        // After registration, login to backend
        await loginUser(token);
      } catch (backendError) {
        console.error("Error registering with backend:", backendError);
        // Continue even if backend registration fails
      }
      
      return user;
    } catch (error) {
      console.error("Error registering with email/password:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Logout from backend if user is authenticated
      try {
        if (auth.currentUser) {
          await logoutUser();
        }
      } catch (backendError) {
        console.error("Error logging out from backend:", backendError);
        // Continue with Firebase logout even if backend logout fails
      }
      
      await firebaseSignOut(auth);
      setUserRole(null);
    } catch (error) {
      console.error("Error signing out:", error);
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

