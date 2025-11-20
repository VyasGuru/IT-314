import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export function PropertyFilters({ filters, onFiltersChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const amenities = [
    "Swimming Pool",
    "Gym",
    "Parking",
    "Balcony",
    "Garden",
    "Security",
    "Elevator",
    "Air Conditioning",
    "Fireplace",
    "Garage",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFiltersChange({ ...filters, [name]: value });
  };

  const handleAmenityChange = (e) => {
    const { name, checked } = e.target;
    const newAmenities = checked
      ? [...filters.amenities, name]
      : filters.amenities.filter((amenity) => amenity !== name);
    onFiltersChange({ ...filters, amenities: newAmenities });
  };

  const clearFilters = () => {
    onFiltersChange({
      propertyType: "",
      bedrooms: "",
      bathrooms: "",
      priceRange: "",
      amenities: [],
    });
  };

  return (
    <div className="mb-8">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {isOpen && (
        <div className="border rounded p-6 mb-6 bg-white shadow">
          {/* Property Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Property Type
              </label>
              <select
                name="propertyType"
                className="w-full border px-3 py-2 rounded"
                value={filters.propertyType}
                onChange={handleInputChange}
              >
                <option value="">Any Type</option>
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Commercial">Commercial</option>
                <option value="Land">Land</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Bedrooms
              </label>
              <select
                name="bedrooms"
                className="w-full border px-3 py-2 rounded"
                value={filters.bedrooms}
                onChange={handleInputChange}
              >
                <option value="">Any</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Bathrooms
              </label>
              <select
                name="bathrooms"
                className="w-full border px-3 py-2 rounded"
                value={filters.bathrooms}
                onChange={handleInputChange}
              >
                <option value="">Any</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Price Range
            </label>
            <select
              name="priceRange"
              className="w-full border px-3 py-2 rounded"
              value={filters.priceRange}
              onChange={handleInputChange}
            >
              <option value="">Any</option>
              <option value="0-100k">₹0 - ₹100k</option>
              <option value="100k-300k">₹100k - ₹300k</option>
              <option value="300k-500k">₹300k - ₹500k</option>
              <option value="500k-1m">₹500k - ₹1M</option>
              <option value="1m+">₹1M+</option>
            </select>
          </div>

          {/* Amenities */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Amenities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={amenity}
                    name={amenity}
                    className="h-4 w-4"
                    checked={filters.amenities.includes(amenity)}
                    onChange={handleAmenityChange}
                  />
                  <label htmlFor={amenity} className="text-sm font-medium">
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
              onClick={clearFilters}
            >
              Clear All
            </button>
            <button
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setIsOpen(false)}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
