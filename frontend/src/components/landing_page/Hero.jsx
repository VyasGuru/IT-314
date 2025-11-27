import { useState } from "react";
import { Search, MapPin, Home, DollarSign } from "lucide-react";

export function Hero({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const handleSearch = () => {
    onSearch({ searchTerm, propertyType, priceRange });
  };

  return (
    <section className="relative bg-gradient-to-r from-blue-50 via-white to-blue-50 py-20">
      <div className="container mx-auto px-4">
        {/* Hero Text */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Find Your Dream Home
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the perfect property with our extensive collection of
            homes, apartments, and commercial spaces
          </p>
        </div>

        {/* Search Form */}
        <div className="hidden md:block max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Location Input */}
            <div className="relative">
              <label htmlFor="location-search" className="sr-only">Enter location</label>
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                id="location-search"
                placeholder="Enter location"
                className="pl-10 pr-3 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>

            {/* Property Type */}
            <div>
              <label htmlFor="property-type" className="sr-only">Property Type</label>
              <select
                id="property-type"
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="">Property Type</option>
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Commercial">Commercial</option>
                <option value="Land">Land</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label htmlFor="price-range" className="sr-only">Price Range</label>
              <select
                id="price-range"
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option value="">Price Range</option>
                <option value="0-100k">₹0 - ₹100k</option>
                <option value="100k-300k">₹100k - ₹300k</option>
                <option value="300k-500k">₹300k - ₹500k</option>
                <option value="500k-1m">₹500k - ₹1M</option>
                <option value="1m+">₹1M+</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors px-4 py-2"
            >
              <Search className="h-4 w-4" />
              Search Properties
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-4 sm:grid sm:grid-cols-3 md:grid-cols-3 mt-16 max-w-3xl mx-auto">
          <div className="text-center flex-1 min-w-[120px]">
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mx-auto mb-2 sm:mb-4">
              <Home className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <h3 className="text-xl sm:text-3xl font-bold text-blue-600">1000+</h3>
            <p className="text-xs sm:text-gray-600">Properties Listed</p>
          </div>

          <div className="text-center flex-1 min-w-[120px]">
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mx-auto mb-2 sm:mb-4">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <h3 className="text-xl sm:text-3xl font-bold text-blue-600">₹250M+</h3>
            <p className="text-xs sm:text-gray-600">Total Sales Value</p>
          </div>

          <div className="text-center flex-1 min-w-[120px]">
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mx-auto mb-2 sm:mb-4">
              <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <h3 className="text-xl sm:text-3xl font-bold text-blue-600">50+</h3>
            <p className="text-xs sm:text-gray-600">Cities Covered</p>
          </div>
        </div>
      </div>
    </section>
  );
}
