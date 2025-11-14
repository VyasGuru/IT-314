import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
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
              {["Properties", "Buy", "Rent", "Sell", "About Us", "Contact"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {[
                "Property Management",
                "Market Analysis",
                "Legal Services",
              ].map((service) => (
                <li key={service}>
                  <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">{service}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            
            <p className="text-gray-600 mb-4">
             
            </p>
            
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
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((policy) => (
              <a key={policy} href="#" className="hover:text-blue-600 transition-colors">{policy}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
