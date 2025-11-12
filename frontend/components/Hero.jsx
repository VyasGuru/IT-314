import { Search, MapPin, Home, DollarSign } from "lucide-react";

export function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-blue-50 via-white to-blue-50 py-20">
      <div className="container mx-auto px-4">
        {/* Hero Text */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Find Your Dream Home
          </h1>
          <p className="text-xl texgit --version
600 max-w-2xl mx-auto">
            Discover the perfect property with our extensive collection of homes, apartments, and commercial spaces
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Location Input */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter location"
                className="pl-10 pr-3 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Property Type */}
            <select className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full">
              <option value="">Property Type</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
            </select>

            {/* Price Range */}
            <select className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full">
              <option value="">Price Range</option>
              <option value="0-100k">₹0 - ₹100k</option>
              <option value="100k-300k">₹100k - ₹300k</option>
              <option value="300k-500k">₹300k - ₹500k</option>
              <option value="500k-1m">₹500k - ₹1M</option>
              <option value="1m+">₹1M+</option>
            </select>

            {/* Search Button */}
            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors px-4 py-2">
              <Search className="h-4 w-4" />
              Search Properties
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
              <Home className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-blue-600">1000+</h3>
            <p className="text-gray-600">Properties Listed</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-blue-600">₹250M+</h3>
            <p className="text-gray-600">Total Sales Value</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-blue-600">50+</h3>
            <p className="text-gray-600">Cities Covered</p>
          </div>
        </div>
      </div>
    </section>
  );
}
