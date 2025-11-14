import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, Phone, Mail, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function Header({ user }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Properties", path: "/properties" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Contact", path: "/contact" },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="border-b bg-gray-50/95 backdrop-blur sticky top-0 z-50">
      {/* Top bar */}
      <div className="border-b bg-gray-100/50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 9993339339</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@findmysquare.com</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  {user.picture && (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name || user.email}</span>
                    {user.role && (
                      <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                    )}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* 3. Wrap the logo in a Link to navigate home */}
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">FS</span>
              </div>
              <span className="text-xl font-bold">FindMySquare</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6">
              {/* 4. Map over the new array and use Link component */}
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path} // Use `to` instead of `href`
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 min-w-[300px]">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search properties..."
                className="border-0 bg-transparent p-0 w-full focus:outline-none focus:ring-0"
              />
            </div>
            <button className="border px-2 py-1 rounded lg:hidden hover:bg-gray-200">
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}