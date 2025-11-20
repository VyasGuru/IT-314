import { MapPin, Bed, Bath, Square, Heart, Eye, GitCompare } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatLocation } from "../../utils/formatLocation";
import { useComparison } from "../../contexts/ComparisonContext";
import { useAuth } from "../../contexts/AuthContext";

export function PropertyCard({ 
  id, 
  _id,
  title, 
  price, 
  location, 
  bedrooms, 
  bathrooms, 
  area,
  size,
  image, 
  images = [],
  status,
  featured = false,
  onViewDetails,
  ...rest
}) {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { properties: comparedProperties, addProperty, removeProperty, updatingId } = useComparison();
  const propertyId = id || _id || rest?.propertyId;
  const locationString = formatLocation(location);
  const areaString = area || (size ? `${size} sq ft` : "N/A");
  const primaryImage = image || images?.[0] || rest?.coverImage || "/placeholder.jpg";
  const isCompared = useMemo(
    () => comparedProperties.some((item) => (item._id || item.id) === propertyId),
    [comparedProperties, propertyId]
  );
  const isUpdating = updatingId === propertyId;
  const propertyPayload = useMemo(
    () => ({
      _id: propertyId,
      title,
      price,
      location,
      bedrooms,
      bathrooms,
      size,
      area: areaString,
      status,
      propertyType: rest?.propertyType,
      yearBuild: rest?.yearBuild,
      amenities: rest?.amenities,
      images: images?.length ? images : image ? [image] : [],
    }),
    [
      areaString,
      bathrooms,
      bedrooms,
      images,
      image,
      location,
      price,
      propertyId,
      rest?.amenities,
      rest?.propertyType,
      rest?.yearBuild,
      size,
      status,
      title,
    ]
  );
  
  const handleViewDetails = () => {
    if (onViewDetails && propertyId) {
      onViewDetails(propertyId);
    }
  };

  const handleComparisonToggle = async (event) => {
    event.stopPropagation();
    if (!propertyId) return;
    if (!currentUser) {
      navigate("/login");
      return;
    }
    try {
      if (isCompared) {
        await removeProperty(propertyId);
      } else {
        await addProperty(propertyPayload);
      }
    } catch (err) {
      console.error("Comparison error:", err);
      alert(err?.response?.data?.message || "Unable to update comparison list right now.");
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "for-sale":
        return (
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
            For Sale
          </span>
        );
      case "for-rent":
        return (
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
            For Rent
          </span>
        );
      case "sold":
        return (
          <span className="bg-gray-400 text-white text-xs px-2 py-1 rounded">
            Sold
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-white">
      {/* Image */}
      <div className="relative">
        <div className="aspect-video overflow-hidden">
          <img
            src={primaryImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => e.target.src = "/placeholder.jpg"} // fallback image
          />
        </div>

        {/* Status & Featured */}
        <div className="absolute top-4 left-4 flex gap-2">
          {getStatusBadge()}
          {featured && (
            <span className="border border-gray-300 text-gray-700 text-xs px-2 py-1 rounded">
              Featured
            </span>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-1 rounded-full hover:bg-white transition-colors"
        >
          <Heart className={`h-4 w-4 ${liked ? "text-red-500" : "text-gray-500"}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <div className="flex items-center text-gray-500 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{locationString}</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{price}</p>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{bedrooms} bed</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{bathrooms} bath</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            <span>{areaString}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={handleViewDetails}
            className="w-full flex items-center justify-center gap-2 border border-blue-600 text-blue-600 rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors"
            disabled={!onViewDetails}
          >
            <Eye className="h-4 w-4" />
            View Details
          </button>
          <button
            onClick={handleComparisonToggle}
            className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors ${
              isCompared
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            disabled={isUpdating}
          >
            <GitCompare className="h-4 w-4" />
            {isCompared ? "In Compare" : "Compare"}
          </button>
        </div>
      </div>
    </div>
  );
}
