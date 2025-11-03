import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export function PropertyFilters({ onFiltersChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedFilters, setSelectedFilters] = useState([]);

  const amenities = [
    "Swimming Pool", "Gym", "Parking", "Balcony", "Garden", 
    "Security", "Elevator", "Air Conditioning", "Fireplace", "Garage"
  ];

  const addFilter = (filter) => {
    if (!selectedFilters.includes(filter)) {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  const removeFilter = (filter) => {
    setSelectedFilters(selectedFilters.filter(f => f !== filter));
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
          {selectedFilters.length > 0 && (
            <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">
              {selectedFilters.length}
            </span>
          )}
        </button>

        {/* Active Filters */}
        {selectedFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedFilters.map((filter) => (
              <div
                key={filter}
                className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm"
              >
                {filter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter(filter)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {isOpen && (
        <div className="border rounded p-6 mb-6 bg-white shadow">
          {/* Property Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Property Type</label>
              <select
                className="w-full border px-3 py-2 rounded"
                onChange={(e) => addFilter(`Type: ${e.target.value}`)}
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
              <label className="block text-sm font-medium mb-2">Bedrooms</label>
              <select
                className="w-full border px-3 py-2 rounded"
                onChange={(e) => addFilter(`Bedrooms: ${e.target.value}`)}
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
              <label className="block text-sm font-medium mb-2">Bathrooms</label>
              <select
                className="w-full border px-3 py-2 rounded"
                onChange={(e) => addFilter(`Bathrooms: ${e.target.value}`)}
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
              Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
            </label>
            <input
              type="range"
              min={0}
              max={200000000}
              step={50000}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full"
            />
          </div>

          {/* Amenities */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Amenities</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={amenity}
                    className="h-4 w-4"
                    onChange={(e) =>
                      e.target.checked
                        ? addFilter(`Amenity: ${amenity}`)
                        : removeFilter(`Amenity: ${amenity}`)
                    }
                  />
                  <label htmlFor={amenity} className="text-sm font-medium">{amenity}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
              onClick={() => {
                setSelectedFilters([]);
                setPriceRange([0, 1000000]);
              }}
            >
              Clear All
            </button>
            <button
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => {
                onFiltersChange({ selectedFilters, priceRange });
                setIsOpen(false);
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
