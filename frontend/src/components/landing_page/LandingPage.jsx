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
        // Send all filters and sortBy to backend
        const response = await getProperties({
          ...filters,
          sortBy: sortBy
        });
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
  }, [filters, sortBy]);

  const handleViewDetails = (propertyId) => {
    const property = filteredProperties.find((p) => p._id === propertyId);
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

