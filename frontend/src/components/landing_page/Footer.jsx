import { useState } from "react";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { PolicyModal } from "./PolicyModal";

export function Footer() {
  const [modalContent, setModalContent] = useState(null);

  const links = [
    { name: "Properties", path: "/properties" },
    { name: "Buy", path: "/properties" },
    { name: "Rent", path: "/properties" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const policies = {
    "Privacy Policy": "We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible way.",
    "Terms of Service": "By using our website, you agree to be bound by these terms.",
    "Cookie Policy": "We use cookies to improve your experience on our website.",
  };

  const handlePolicyClick = (policy) => {
    setModalContent({ title: policy, content: policies[policy] });
  };

  return (
    <>
      <footer className="bg-gray-100 border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">FS</span>
                </div>
                <span className="text-xl font-bold">FindMySquare</span>
              </div>
              <p className="text-gray-600 mb-4">
                Your trusted partner in finding the perfect property. We make real estate dreams come true.
              </p>
              <div className="flex gap-2">
                <button className="border rounded p-2 hover:bg-gray-200">
                  <Facebook className="h-4 w-4 text-blue-600" />
                </button>
                <button className="border rounded p-2 hover:bg-gray-200">
                  <Twitter className="h-4 w-4 text-blue-400" />
                </button>
                <button className="border rounded p-2 hover:bg-gray-200">
                  <Instagram className="h-4 w-4 text-pink-500" />
                </button>
                <button className="border rounded p-2 hover:bg-gray-200">
                  <Linkedin className="h-4 w-4 text-blue-700" />
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-gray-600 hover:text-blue-600 transition-colors">{link.name}</Link>
                  </li>
                ))}
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Sell</a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+91 9993339339</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>info@findmysquare.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>123 Real Estate St, Gandhinagar, Gujarat 382421</span>
                </div>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t my-8"></div>

          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
            <p>&copy; 2025 FindMySquare. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              {Object.keys(policies).map((policy) => (
                <button key={policy} onClick={() => handlePolicyClick(policy)} className="hover:text-blue-600 transition-colors">{policy}</button>
              ))}
            </div>
          </div>
        </div>
      </footer>
      {modalContent && (
        <PolicyModal
          title={modalContent.title}
          content={modalContent.content}
          onClose={() => setModalContent(null)}
        />
      )}
    </>
  );
}
