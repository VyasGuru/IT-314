import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, Phone, Mail, LogOut, GitCompare, X, User } from "lucide-react"; // Import X icon for close and User icon
import { useAuth } from "../../contexts/AuthContext";
import { useComparison } from "../../contexts/ComparisonContext";
import { useState } from "react"; // Import useState

export function Header({ user }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { properties: comparedProperties } = useComparison();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Properties", path: "/properties" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "Compare", path: "/compare" },
  ];
  const comparisonCount = comparedProperties.length;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
      setIsMobileMenuOpen(false); // Close menu on sign out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleProfileClick = () => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      }
      else {
        navigate('/dashboard');
      }
      setIsMobileMenuOpen(false); // Close menu on navigation
    }
  };

  return (
    <header className="border-b bg-gray-50/95 backdrop-blur sticky top-0 z-50">
      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">FS</span>
              </div>
              <span className="text-xl font-bold">FindMySquare</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            
            <Link
              to="/compare"
              className="hidden md:flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-lg hover:bg-white transition-colors"
            >
              <GitCompare className="h-4 w-4" />
              <span className="text-sm font-medium text-gray-700">Compare</span>
              {comparisonCount > 0 && (
                <span className="ml-1 text-xs font-semibold text-white bg-blue-600 rounded-full px-2 py-0.5">
                  {comparisonCount}
                </span>
              )}
            </Link>

            <button 
              className="border px-2 py-1 rounded lg:hidden hover:bg-gray-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {/* Simplified user button for mobile */}
                  <button
                    onClick={handleProfileClick}
                    className="flex md:hidden items-center justify-center w-8 h-8 rounded-full bg-gray-200/60 hover:bg-gray-300 transition-colors"
                    title="View Dashboard"
                  >
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4 text-gray-600" />
                    )}
                  </button>

                  {/* Full user button for desktop */}
                  <button
                    onClick={handleProfileClick}
                    className="hidden md:flex items-center gap-3 hover:bg-gray-200/60 rounded-full px-2 py-1 transition-colors"
                    title="View Dashboard"
                  >
                    {user.picture && (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">
                        {user.name || user.email}
                      </span>
                      {user.role && (
                        <span className="text-xs text-gray-500 capitalize">
                          {user.role}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="hidden sm:flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <Link to="/login" className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-gray-50 border-t">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t">

              
            </div>
          </div>
        </div>
      )}
    </header>
  );
}