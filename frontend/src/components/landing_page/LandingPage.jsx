import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProperties } from "../../services/propertyApi";

// Import components specific to the Landing Page
import { Hero } from "./Hero";
import { PropertyCard } from "./PropertyCard";
import { PropertyFilters } from "./PropertyFilters";
import { PropertyDetails } from "./PropertyDetails";
import { Grid, List } from "lucide-react";

const LandingPage = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [filters, setFilters] = useState({
    searchTerm: "",
    propertyType: "",
    priceRange: "",
    bedrooms: "",
    bathrooms: "",
    amenities: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await getProperties();
        if (response?.data && Array.isArray(response.data)) {
          setProperties(response.data);
          setFilteredProperties(response.data);
        } else {
          console.warn("Unexpected response format:", response);
          setProperties([]);
          setFilteredProperties([]);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        // Set empty arrays on error so UI doesn't break
        setProperties([]);
        setFilteredProperties([]);
        
        // Show user-friendly error message
        if (error.message && error.message.includes("timeout")) {
          console.error("Backend server timeout. Please ensure the backend is running on http://localhost:8000");
        } else if (error.message && error.message.includes("Network Error")) {
          console.error("Cannot connect to backend server. Please ensure it's running.");
        }
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    let tempProperties = [...properties];

    // Filtering first, before sorting - Case insensitive search
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase().trim();
      tempProperties = tempProperties.filter((p) => {
        // Search in title (case insensitive)
        const titleMatch = p.title?.toLowerCase().includes(searchLower);
        
        // Search in description (case insensitive)
        const descriptionMatch = p.description?.toLowerCase().includes(searchLower);
        
        // Search in location fields (case insensitive)
        const cityMatch = p.location?.city?.toLowerCase().includes(searchLower);
        const stateMatch = p.location?.state?.toLowerCase().includes(searchLower);
        const streetMatch = p.location?.street?.toLowerCase().includes(searchLower);
        const localityMatch = p.location?.locality?.toLowerCase().includes(searchLower);
        const zipCodeMatch = p.location?.zipCode?.toLowerCase().includes(searchLower);
        
        // Search in full location string (case insensitive)
        const locationString = `${p.location?.street || ''} ${p.location?.locality || ''} ${p.location?.city || ''} ${p.location?.state || ''} ${p.location?.zipCode || ''}`.toLowerCase();
        const locationMatch = locationString.includes(searchLower);
        
        // Search in property type (case insensitive)
        const propertyTypeMatch = p.propertyType?.toLowerCase().includes(searchLower);
        
        return titleMatch || descriptionMatch || cityMatch || stateMatch || 
               streetMatch || localityMatch || zipCodeMatch || locationMatch || 
               propertyTypeMatch;
      });
    }
    
    if (filters.propertyType) {
      tempProperties = tempProperties.filter(
        (p) => p.propertyType === filters.propertyType
      );
    }
    
    // Bedrooms filter
    if (filters.bedrooms) {
      if (filters.bedrooms === "5+") {
        tempProperties = tempProperties.filter((p) => p.bedrooms >= 5);
      } else {
        const bedrooms = parseInt(filters.bedrooms);
        tempProperties = tempProperties.filter((p) => p.bedrooms === bedrooms);
      }
    }
    
    // Bathrooms filter
    if (filters.bathrooms) {
      if (filters.bathrooms === "4+") {
        tempProperties = tempProperties.filter((p) => p.bathrooms >= 4);
      } else {
        const bathrooms = parseInt(filters.bathrooms);
        tempProperties = tempProperties.filter((p) => p.bathrooms === bathrooms);
      }
    }
    
    // Price range filter
    if (filters.priceRange) {
      tempProperties = tempProperties.filter((p) => {
        const price = typeof p.price === 'number' ? p.price : parseFloat(p.price?.toString().replace(/[^0-9.-]+/g, "") || 0);
        
        switch (filters.priceRange) {
          case "0-100k":
            return price >= 0 && price <= 100000;
          case "100k-300k":
            return price > 100000 && price <= 300000;
          case "300k-500k":
            return price > 300000 && price <= 500000;
          case "500k-1m":
            return price > 500000 && price <= 1000000;
          case "1m+":
            return price > 1000000;
          default:
            return true;
        }
      });
    }
    
    // Amenities filter - Map frontend amenity names to backend keys
    if (filters.amenities && filters.amenities.length > 0) {
      const amenityMap = {
        "Swimming Pool": "swimmingPool",
        "Gym": "gym",
        "Parking": "parking",
        "Balcony": "balcony",
        "Garden": "garden",
        "Security": "security",
        "Elevator": "lift",
        "Air Conditioning": "airConditioning",
        "Fireplace": "fireplace",
        "Garage": "garage",
        "WiFi": "wifi",
        "Power Backup": "powerBackup",
        "Clubhouse": "clubhouse",
        "Play Area": "playArea",
        "Furnished": "furnished",
      };
      
      tempProperties = tempProperties.filter((p) => {
        if (!p.amenities || typeof p.amenities !== 'object') return false;
        // Check if property has at least one of the selected amenities
        return filters.amenities.some((amenity) => {
          const backendKey = amenityMap[amenity] || amenity.toLowerCase().replace(/\s+/g, '');
          // Try both the mapped key and original key (case insensitive)
          return (
            p.amenities[backendKey] === true ||
            p.amenities[amenity] === true ||
            p.amenities[amenity.toLowerCase()] === true ||
            p.amenities[amenity.toLowerCase().replace(/\s+/g, '')] === true
          );
        });
      });
    }

    // Featured filter - only if sortBy is "featured"
    if (sortBy === "featured") {
      // Show featured first, but also show non-featured if no featured properties
      const featuredProperties = tempProperties.filter((p) => p.featured === true);
      if (featuredProperties.length > 0) {
        tempProperties = featuredProperties;
      }
      // If no featured properties, show all (don't filter)
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        tempProperties.sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price?.toString().replace(/[^0-9.-]+/g, "") || 0);
          const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price?.toString().replace(/[^0-9.-]+/g, "") || 0);
          return priceA - priceB;
        });
        break;
      case "price-high":
        tempProperties.sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price?.toString().replace(/[^0-9.-]+/g, "") || 0);
          const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price?.toString().replace(/[^0-9.-]+/g, "") || 0);
          return priceB - priceA;
        });
        break;
      case "newest":
        tempProperties.sort((a, b) => {
          const yearA = a.yearBuild || a.yearBuilt || 0;
          const yearB = b.yearBuild || b.yearBuilt || 0;
          return yearB - yearA;
        });
        break;
      case "oldest":
        tempProperties.sort((a, b) => {
          const yearA = a.yearBuild || a.yearBuilt || 0;
          const yearB = b.yearBuild || b.yearBuilt || 0;
          return yearA - yearB;
        });
        break;
      case "featured":
        // Already filtered above, but also sort featured first
        tempProperties.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
        break;
      default:
        // Default: show all properties, no special sorting
        break;
    }

    setFilteredProperties(tempProperties);
  }, [filters, sortBy, properties]);

  const handleViewDetails = (propertyId) => {
    const property = properties.find((p) => p._id === propertyId);
    setSelectedProperty(property || null);
    setIsDetailsOpen(true);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  const handleSearch = (searchFilters) => {
    // Merge search filters from Hero component
    // Only update filters that are provided (non-empty or explicitly set)
    setFilters((prevFilters) => ({
      ...prevFilters,
      searchTerm: searchFilters.searchTerm !== undefined ? searchFilters.searchTerm : prevFilters.searchTerm,
      propertyType: searchFilters.propertyType !== undefined ? searchFilters.propertyType : prevFilters.propertyType,
      priceRange: searchFilters.priceRange !== undefined ? searchFilters.priceRange : prevFilters.priceRange,
    }));
  };

  const handleLoadMore = () => {
    navigate("/properties", { state: { filters } });
  };

  return (
    <>
      <Hero onSearch={handleSearch} />
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Properties</h2>
            <p className="text-muted-foreground">
              Discover our handpicked selection of premium properties
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <select
              className="w-full border rounded-lg p-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <div className="hidden md:flex border rounded-lg">
              <button
                className={`p-2 rounded-l-lg ${
                  viewMode === "grid" ? "bg-gray-200" : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                className={`p-2 rounded-r-lg ${
                  viewMode === "list" ? "bg-gray-200" : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <PropertyFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
        {filteredProperties.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property._id}
                {...property}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500 mb-4">No properties found matching your search criteria.</p>
            <button
              onClick={() => {
                setFilters({
                  searchTerm: "",
                  propertyType: "",
                  priceRange: "",
                  bedrooms: "",
                  bathrooms: "",
                  amenities: [],
                });
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
        <div className="text-center mt-12">
          <button
            onClick={handleLoadMore}
            className="border rounded-lg px-6 py-2 hover:bg-gray-100"
          >
            Load More Properties</button>
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

export default LandingPage;

