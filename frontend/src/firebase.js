// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDyu7ZrVuo0uU0trh_NITT7_p-oa9JJx7Y",
  authDomain: "real-estate-listing-8bb0a.firebaseapp.com",
  projectId: "real-estate-listing-8bb0a",
  storageBucket: "real-estate-listing-8bb0a.firebasestorage.app",
  messagingSenderId: "941411607139",
  appId: "1:941411607139:web:f29abcfb1a20aed7c48e56",
  measurementId: "G-2XNK5X57NX"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw error;
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== "undefined") {
  try {
    // Only initialize analytics if we're not in development mode
    // or if you want analytics in development, remove this check
    if (import.meta.env.PROD) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    // Analytics initialization failed - this is okay, we can continue without it
    console.warn("Analytics initialization error:", error);
  }
}

export { analytics };
export default app;

