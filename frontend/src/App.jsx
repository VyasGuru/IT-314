import { Routes, Route } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import PreventBackNavigation from "./components/PreventBackNavigation";
import { SavedListingsProvider } from "./contexts/SavedListingsContext";
import { Toaster } from 'react-hot-toast';

import { Header } from "./components/landing_page/Header";
import { Footer } from "./components/landing_page/Footer";

import AboutPage from "./components/about_page/AboutPage";
import ContactPage from "./components/contact_page/ContactPage";
import LoginPage from "./components/login_page/LoginPage";
import RegisterPage from "./components/login_page/RegisterPage";
import ForgotPasswordPage from "./components/login_page/ForgotPasswordPage";
import AdminForgotPasswordPage from "./components/login_page/AdminForgotPasswordPage";
import UserDashboard from "./components/user_dashboard/UserDashboard";
import PropertiesPage from "./components/properties_page/PropertiesPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./components/admin_dashboard/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import LandingPage from "./components/landing_page/LandingPage";
import PropertyComparisonPage from "./components/comparison_page/PropertyComparisonPage";
import EditListing from "./components/user_dashboard/EditListing";
import AddListing from "./components/user_dashboard/AddListing";

export default function App() {
  const { currentUser, userRole } = useAuth();

  const user = currentUser
    ? {
        name: currentUser.displayName || currentUser.email,
        email: currentUser.email,
        picture: currentUser.photoURL || null,
        role: userRole,
      }
    : null;

  // If the backend has a profile photo (stored outside Firebase), prefer it when Firebase photoURL is missing
  // Get backend user from AuthContext if available
  const { backendUser } = useAuth();
  if (backendUser && backendUser.photo) {
    user && (user.picture = user.picture || backendUser.photo);
  }

  return (
    <SavedListingsProvider>
      <div className="min-h-screen bg-background">
        <Toaster position="top-center" reverseOrder={false} />
        <PreventBackNavigation />
        <ScrollToTop />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header user={user} />
                <LandingPage />
                <Footer />
              </>
            }
          />

          <Route
            path="/about"
            element={
              <>
                <Header user={user} />
                <AboutPage />
                <Footer />
              </>
            }
          />

          <Route
            path="/login"
            element={
              <div className="min-h-screen bg-white flex items-center justify-center">
                <LoginPage />
              </div>
            }
          />

          <Route
            path="/register"
            element={
              <div className="min-h-screen bg-white flex items-center justify-center">
                <RegisterPage />
              </div>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <div className="min-h-screen bg-white flex items-center justify-center">
                <ForgotPasswordPage />
              </div>
            }
          />

          <Route
            path="/admin/forgot-password"
            element={
              <div className="min-h-screen bg-white flex items-center justify-center">
                <AdminForgotPasswordPage />
              </div>
            }
          />

          <Route
            path="/contact"
            element={
              <>
                <Header user={user} />
                <ContactPage />
                <Footer />
              </>
            }
          />

          <Route
            path="/properties"
            element={
              <>
                <Header user={user} />
                <PropertiesPage />
                <Footer />
              </>
            }
          />

          <Route
            path="/compare"
            element={
              <>
                <Header user={user} />
                <PropertyComparisonPage />
                <Footer />
              </>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <>
                  <Header user={user} />
                  <UserDashboard />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-listings/edit/:propertyId"
            element={
              <ProtectedRoute>
                <>
                  <Header user={user} />
                  <EditListing />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-listings/add"
            element={
              <ProtectedRoute>
                <>
                  <Header user={user} />
                  <AddListing />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <>
                  <Header user={user} />
                  <AdminDashboard />
                </>
              </AdminRoute>
            }
          />
        </Routes>
      </div>
    </SavedListingsProvider>
  );
}
