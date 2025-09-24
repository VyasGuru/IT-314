import { useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { PropertyCard } from "./components/PropertyCard";
import { PropertyFilters } from "./components/PropertyFilters";
import { PropertyDetails } from "./components/PropertyDetails";
import { Footer } from "./components/Footer";
import { Grid, List } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

// Mock data for properties
const mockProperties = [
  
  {
    id: "2",
    title: "Downtown Luxury Apartment",
    price: "₹3,200/month",
    location: "Ahemdabad , GJ",
    bedrooms: 2,
    bathrooms: 2,
    area: "1,200 sq ft",
    image:
      "https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc0MjY2ODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    images: [
      "https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc0MjY2ODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1546552229-7b16095d6904?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBob21lJTIwa2l0Y2hlbnxlbnwxfHx8fDE3NTc0MTE0NjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
  status: "for-rent",
    description:
      "Elegant apartment in the heart of Manhattan with premium amenities and stunning city views. Perfect for urban professionals.",
    features: [
      "City View",
      "Gym",
      "Doorman",
      "Elevator",
      "Air Conditioning",
      "Balcony",
    ],
    yearBuilt: "2018",
    propertyType: "Apartment",
    agent: {
      name: "Michael Chen",
      phone: "+91 9493939393",
      email: "michael@realestate.com",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
  },
  {
    id: "3",
    title: "Contemporary Family Home",
    price: "₹525,000",
    location: "Baroda , GJ",
    bedrooms: 3,
    bathrooms: 2,
    area: "1,800 sq ft",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWFsJTIwZXN0YXRlJTIwcHJvcGVydHl8ZW58MXx8fHwxNzU3NDAyNDMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWFsJTIwZXN0YXRlJTIwcHJvcGVydHl8ZW58MXx8fHwxNzU3NDAyNDMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
  status: "for-sale",
    description:
      "Beautiful family home in a quiet neighborhood with modern amenities and a spacious backyard. Great for families.",
    features: [
      "Garden",
      "Garage",
      "Fireplace",
      "Walk-in Closet",
      "Patio",
    ],
    yearBuilt: "2015",
    propertyType: "House",
    agent: {
      name: "Emily Rodriguez",
      phone: "+91 9493939393",
      email: "emily@realestate.com",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
  },
  {
    id: "4",
    title: "Luxury Mountain Villa",
    price: "₹1,200,000",
    location: "Mumbai , MH",
    bedrooms: 5,
    bathrooms: 4,
    area: "3,500 sq ft",
    image:
      "https://images.unsplash.com/photo-1670589953882-b94c9cb380f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYXxlbnwxfHx8fDE3NTczNDA5ODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    images: [
      "https://images.unsplash.com/photo-1670589953882-b94c9cb380f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYXxlbnwxfHx8fDE3NTczNDA5ODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
  status: "for-sale",
    featured: true,
    description:
      "Exclusive mountain villa with panoramic views and luxury amenities. Perfect retreat for those seeking tranquility.",
    features: [
      "Mountain View",
      "Fireplace",
      "Hot Tub",
      "Ski Storage",
      "Wine Cellar",
      "Garage",
    ],
    yearBuilt: "2019",
    propertyType: "Villa",
    agent: {
      name: "David Thompson",
      phone: "+91 9493939393",
      email: "david@realestate.com",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
  },
  {
    id: "5",
    title: "Urban Loft",
    price: "₹2,800/month",
    location: "Bangalore, KA",
    bedrooms: 1,
    bathrooms: 1,
    area: "900 sq ft",
    image:
      "https://images.unsplash.com/photo-1641289426957-1748d0b5de04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwYXBhcnRtZW50JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzU3NDMwOTc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    images: [
      "https://images.unsplash.com/photo-1641289426957-1748d0b5de04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwYXBhcnRtZW50JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzU3NDMwOTc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
  status: "for-rent",
    description:
      "Stylish urban loft with exposed brick walls and high ceilings. Perfect for young professionals.",
    features: [
      "High Ceilings",
      "Exposed Brick",
      "Modern Kitchen",
      "Hardwood Floors",
    ],
    yearBuilt: "2016",
    propertyType: "Loft",
    agent: {
      name: "Jessica Park",
      phone: "+91 9493939393",
      email: "jessica@realestate.com",
      image:
        "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
  },
  {
    id: "6",
    title: "Suburban Family Home",
    price: "₹425,000",
    location: "Surat, GJ",
    bedrooms: 4,
    bathrooms: 2,
    area: "2,100 sq ft",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3VzZSUyMGV4dGVyaW9yfGVufDF8fHx8MTc1NzQyNTkxNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3VzZSUyMGV4dGVyaW9yfGVufDF8fHx8MTc1NzQyNTkxNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
  status: "sold",
    description:
      "Spacious family home in a family-friendly neighborhood with great schools and parks nearby.",
    features: [
      "Swimming Pool",
      "Garage",
      "Patio",
      "Storage Room",
    ],
    yearBuilt: "2012",
    propertyType: "House",
    agent: {
      name: "Robert Kim",
      phone: "+91 9493939393",
      email: "robert@realestate.com",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=[format&fit=crop&w=150&q=80",
    },
  },
];

export default function App() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [user, setUser] = useState(null);

  const handleViewDetails = (propertyId) => {
    const property = mockProperties.find((p) => p.id === propertyId);
    setSelectedProperty(property || null);
    setIsDetailsOpen(true);
  };

  const handleFiltersChange = (filters) => {
    console.log("Filters applied:", filters);
  };

  return (
    <div className="min-h-screen bg-background">
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
      <Hero />

      <main className="container mx-auto px-4 py-12">
        {/* Properties Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Properties</h2>
            <p className="text-muted-foreground">
              Discover our handpicked selection of premium properties
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
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

            {/* View Mode Buttons */}
            <div className="flex border rounded-lg overflow-hidden">
              <button
                className={`p-2 ₹{viewMode === "grid" ? "bg-gray-200" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                className={`p-2 ₹{viewMode === "list" ? "bg-gray-200" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <PropertyFilters onFiltersChange={handleFiltersChange} />

        {/* Properties Grid/List */}
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

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="border rounded-lg px-6 py-2 hover:bg-gray-100">
            Load More Properties
          </button>
        </div>
      </main>

      <Footer />

      {/* Property Details Modal */}
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
    </div>
  );
}