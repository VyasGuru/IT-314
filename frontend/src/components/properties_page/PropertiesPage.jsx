import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getProperties } from "../../services/propertyApi";
import { PropertyCard } from "../landing_page/PropertyCard";
import { PropertyFilters } from "../landing_page/PropertyFilters";
import { Search } from "lucide-react";

const PropertiesPage = () => {
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [filters, setFilters] = useState(
    location.state?.filters || {
      searchTerm: "",
      propertyType: "",
      priceRange: "",
      bedrooms: "",
      bathrooms: "",
      amenities: [],
    }
  );

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Send all filters to backend
        const response = await getProperties(filters);
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
  }, [filters]);

  const handleFiltersChange = (newFilters) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Explore Properties
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find your next home with our powerful search and filtering tools.
        </p>
      </header>

      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by title or location..."
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={filters.searchTerm}
            onChange={(e) =>
              handleFiltersChange({ searchTerm: e.target.value })
            }
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <PropertyFilters filters={filters} onFiltersChange={handleFiltersChange} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <PropertyCard key={property._id} {...property} />
        ))}
      </div>
    </section>
  );
};

export default PropertiesPage;
