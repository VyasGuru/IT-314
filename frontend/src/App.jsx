import { useState } from "react";
import { Routes, Route } from 'react-router-dom'; // 1. Import router components

// Import components used across all pages
import { Header } from "./components/landing_page/Header";
import { Footer } from "./components/landing_page/Footer";

// Import page components
import AboutPage from "./components/about_page/AboutPage";
import ContactPage from "./components/contact_page/ContactPage";
import LoginPage from "./components/login_page/LoginPage";

// Placeholder pages for Properties and Services
const PropertiesPage = () => (
  <>
    <Header />
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Properties</h1>
      <p className="text-gray-600">Browse our extensive collection of properties.</p>
    </div>
    <Footer />
  </>
);

const ServicesPage = () => (
  <>
    <Header />
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Services</h1>
      <p className="text-gray-600">Explore our comprehensive real estate services.</p>
    </div>
    <Footer />
  </>
);

// Import components specific to the Landing Page
import { Hero } from "./components/landing_page/Hero";
import { PropertyCard } from "./components/landing_page/PropertyCard";
import { PropertyFilters } from "./components/landing_page/PropertyFilters";
import { PropertyDetails } from "./components/landing_page/PropertyDetails";
import { Grid, List } from "lucide-react";
import { jwtDecode } from "jwt-decode";

// --- Data and Components for the Landing Page ---

// Mock data for properties
const mockProperties = [
  // ... (your mockProperties array remains unchanged, I've omitted it for brevity)
  { id: "2", title: "Downtown Luxury Apartment", price: "₹3,200/month", location: "Ahemdabad , GJ", bedrooms: 2, bathrooms: 2, area: "1,200 sq ft", image: "https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc0MjY2ODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", images: ["..."], status: "for-rent", description: "...", features: ["..."], yearBuilt: "2018", propertyType: "Apartment", agent: { name: "Michael Chen", phone: "+91 9493939393", email: "michael@realestate.com", image: "..." } },
  { id: "3", title: "Contemporary Family Home", price: "₹525,000", location: "Baroda , GJ", bedrooms: 3, bathrooms: 2, area: "1,800 sq ft", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWFsJTIwZXN0YXRlJTIwcHJvcGVydHl8ZW58MXx8fHwxNzU3NDAyNDMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", images: ["..."], status: "for-sale", description: "...", features: ["..."], yearBuilt: "2015", propertyType: "House", agent: { name: "Emily Rodriguez", phone: "+91 9493939393", email: "emily@realestate.com", image: "..." } },
  { id: "4", title: "Luxury Mountain Villa", price: "₹1,200,000", location: "Mumbai , MH", bedrooms: 5, bathrooms: 4, area: "3,500 sq ft", image: "https://images.unsplash.com/photo-1670589953882-b94c9cb380f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYXxlbnwxfHx8fDE3NTczNDA5ODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", images: ["..."], status: "for-sale", featured: true, description: "...", features: ["..."], yearBuilt: "2019", propertyType: "Villa", agent: { name: "David Thompson", phone: "+91 9493939393", email: "david@realestate.com", image: "..." } },
  { id: "5", title: "Urban Loft", price: "₹2,800/month", location: "Bangalore, KA", bedrooms: 1, bathrooms: 1, area: "900 sq ft", image: "https://images.unsplash.com/photo-1641289426957-1748d0b5de04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwYXBhcnRtZW50JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzU3NDMwOTc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", images: ["..."], status: "for-rent", description: "...", features: ["..."], yearBuilt: "2016", propertyType: "Loft", agent: { name: "Jessica Park", phone: "+91 9493939393", email: "jessica@realestate.com", image: "..." } },
  { id: "6", title: "Suburban Family Home", price: "₹425,000", location: "Surat, GJ", bedrooms: 4, bathrooms: 2, area: "2,100 sq ft", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3VzZSUyMGV4dGVyaW9yfGVufDF8fHx8MTc1NzQyNTkxNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", images: ["..."], status: "sold", description: "...", features: ["..."], yearBuilt: "2012", propertyType: "House", agent: { name: "Robert Kim", phone: "+91 9493939393", email: "robert@realestate.com", image: "..." } },
];

// 2. Create a new component for your main page content
const LandingPage = () => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("featured");

  const handleViewDetails = (propertyId) => {
    const property = mockProperties.find((p) => p.id === propertyId);
    setSelectedProperty(property || null);
    setIsDetailsOpen(true);
  };

  const handleFiltersChange = (filters) => {
    console.log("Filters applied:", filters);
  };

  return (
    <>
      <Hero />
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Properties</h2>
            <p className="text-muted-foreground">
              Discover our handpicked selection of premium properties
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              className="border rounded-lg p-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <div className="flex border rounded-lg overflow-hidden">
              <button
                className={`p-2 ${viewMode === "grid" ? "bg-gray-200" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                className={`p-2 ${viewMode === "list" ? "bg-gray-200" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <PropertyFilters onFiltersChange={handleFiltersChange} />
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {mockProperties.map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
        <div className="text-center mt-12">
          <button className="border rounded-lg px-6 py-2 hover:bg-gray-100">
            Load More Properties
          </button>
        </div>
      </main>

      {isDetailsOpen && selectedProperty && (
        <PropertyDetails
          property={selectedProperty}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedProperty(null);
          }}
        />
      )}
    </>
  );
};

// 3. Update the main App component to be a router
export default function App() {
  const [user, setUser] = useState(null); // Keep user state here to be accessible by all pages

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={
          <>
            <Header
              user={user}
              onGoogleLoginSuccess={(credentialResponse) => {
                const userObject = jwtDecode(credentialResponse.credential);
                setUser(userObject);
              }}
              onGoogleLoginError={() => {
                alert("Login Failed");
              }}
            />
            <LandingPage />
            <Footer />
          </>
        } />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/about" element={
          <>
            <Header user={user} />
            <AboutPage />
            <Footer />
          </>
        } />
        <Route path="/login" element={
          <div className="min-h-screen bg-white flex items-center justify-center">
            <LoginPage />
          </div>
        } />
        <Route path="/contact" element={
          <>
            <Header user={user} />
            <ContactPage />
            <Footer />
          </>
        } />
      </Routes>
    </div>
  );
}