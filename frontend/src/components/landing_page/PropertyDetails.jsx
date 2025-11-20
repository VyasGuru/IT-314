import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { X, MapPin, Bed, Bath, Square, Calendar, Heart, Share, Phone, Mail, GitCompare } from "lucide-react";
import { formatLocation } from "../../utils/formatLocation";
import { useComparison } from "../../contexts/ComparisonContext";
import { useAuth } from "../../contexts/AuthContext";

export function PropertyDetails({ property, isOpen, onClose }) {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { properties: comparedProperties, addProperty, removeProperty, updatingId } = useComparison();

  if (!property || !isOpen) return null;
  
  // Format location if it's an object
  const locationString = formatLocation(property.location);
  const propertyId = property._id || property.id;
  const isCompared = useMemo(
    () => comparedProperties.some((item) => (item._id || item.id) === propertyId),
    [comparedProperties, propertyId]
  );
  const isUpdating = updatingId === propertyId;

  const handleComparisonToggle = async () => {
    if (!propertyId) return;
    if (!currentUser) {
      navigate("/login");
      return;
    }
    try {
      if (isCompared) {
        await removeProperty(propertyId);
      } else {
        await addProperty(property);
      }
    } catch (err) {
      console.error("Comparison error:", err);
      alert(err?.response?.data?.message || "Unable to update comparison right now.");
    }
  };

  const getStatusBadge = () => {
    switch (property.status) {
      case "for-sale":
        return <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">For Sale</span>;
      case "for-rent":
        return <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">For Rent</span>;
      case "sold":
        return <span className="bg-gray-400 text-white text-xs px-2 py-1 rounded">Sold</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-auto p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{property.title}</h2>
            <div className="flex items-center gap-2 mt-1 text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{locationString}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Image Carousel */}
        <div className="relative mb-6">
          <div className="overflow-hidden rounded-lg aspect-video">
            <img
              src={property.images && property.images.length > 0 ? property.images[0] : "/placeholder.jpg"}
              alt={`${property.title} image`}
              className="w-full h-full object-cover"
              onError={(e) => e.target.src = "/placeholder.jpg"}
            />
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <p className="text-3xl font-bold text-blue-600">{property.price}</p>
            <p className="text-gray-500">{property.propertyType}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleComparisonToggle}
              disabled={isUpdating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCompared
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <GitCompare className="h-4 w-4" />
              {isCompared ? "In Compare" : "Add to Compare"}
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className={`p-2 rounded-full border ${liked ? "border-red-500 text-red-500" : "border-gray-300 text-gray-500"}`}
            >
              <Heart className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-full border border-gray-300 text-gray-500">
              <Share className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Property Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6 text-center">
          <div className="p-4 border rounded-lg">
            <Bed className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold">{property.bedrooms}</p>
            <p className="text-sm text-gray-500">Bedrooms</p>
          </div>
          <div className="p-4 border rounded-lg">
            <Bath className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold">{property.bathrooms}</p>
            <p className="text-sm text-gray-500">Bathrooms</p>
          </div>
          <div className="p-4 border rounded-lg">
            <Square className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold">
              {property.area || (property.size ? `${property.size} sq ft` : "N/A")}
            </p>
            <p className="text-sm text-gray-500">Area</p>
          </div>
          <div className="p-4 border rounded-lg">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold">{property.yearBuilt || property.yearBuild || "N/A"}</p>
            <p className="text-sm text-gray-500">Year Built</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-gray-500 leading-relaxed">{property.description}</p>
        </div>

        {/* Features */}
        {property.features && Array.isArray(property.features) && property.features.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Features & Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {property.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <hr className="my-6 border-gray-200" />

        {/* Agent Info */}
        {property.agent && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Contact Agent</h3>
            <div className="flex items-center gap-4 border rounded-lg p-4">
              <img
                src={property.agent?.image || "/placeholder.jpg"}
                alt={property.agent?.name || "Agent"}
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => e.target.src = "/placeholder.jpg"}
              />
              <div className="flex-1">
                <h4 className="font-semibold">{property.agent?.name || "Agent"}</h4>
                <p className="text-sm text-gray-500">Real Estate Agent</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 border border-blue-600 text-blue-600 px-3 py-1 rounded hover:bg-blue-50">
                  <Phone className="h-4 w-4" /> Call
                </button>
                <button className="flex items-center gap-1 border border-blue-600 text-blue-600 px-3 py-1 rounded hover:bg-blue-50">
                  <Mail className="h-4 w-4" /> Email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
