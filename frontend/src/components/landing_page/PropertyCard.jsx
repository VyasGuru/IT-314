import { MapPin, Bed, Bath, Square, Heart, Eye, GitCompare } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatLocation } from "../../utils/formatLocation";
import { useComparison } from "../../contexts/ComparisonContext";
import { useAuth } from "../../contexts/AuthContext";
import { useSavedListings } from "../../contexts/SavedListingsContext";
import { estimatePriceService } from '../../services/priceEstimatorService';
import { getListingByPropertyId } from "../../services/propertyApi";
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

export function PropertyCard({
  id,
  _id,
  listingId,
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
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { properties: comparedProperties, addProperty, removeProperty, updatingId } = useComparison();

  // ===== SAVED LISTINGS CONTEXT =====
  const { isSaved, toggleSaved } = useSavedListings();

  const propertyId = id || _id || rest?.propertyId;

  // Convert values
  const locationString = formatLocation(location);
  const areaString = area || (size ? `${size} sq ft` : "N/A");
  const primaryImage = image || images?.[0] || rest?.coverImage || "/placeholder.jpg";

  const isCompared = useMemo(
    () => comparedProperties.some((item) => (item._id || item.id) === propertyId),
    [comparedProperties, propertyId]
  );

  const isUpdating = updatingId === propertyId;

  const [lister, setLister] = useState(null);

  useEffect(() => {
    const fetchLister = async () => {
      if (propertyId) {
        try {
          const response = await getListingByPropertyId(propertyId);
          if (response?.data?.listerFirebaseUid) {
            setLister(response.data.listerFirebaseUid);
          }
        } catch (error) {
          console.error("Failed to fetch lister details", error);
        }
      }
    };
    fetchLister();
  }, [propertyId]);

  const propertyPayload = {
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
  };

  const handleViewDetails = () => {
    if (onViewDetails && propertyId) {
      onViewDetails(propertyId);
    }
  };

  const handleEstimatePrice = async (event) => {
    event.stopPropagation();
    if (!propertyId) {
      toast.error("Property ID not available for price estimation.");
      return;
    }
    try {
      const listingResponse = await getListingByPropertyId(propertyId);
      const listingId = listingResponse?.data?._id;

      if (!listingId) {
        toast.error("Could not find a listing associated with this property.");
        return;
      }

      const response = await estimatePriceService(listingId);
      if (response.estimatedPrice) {
        toast.success(`Estimated Selling Price: ₹${response.estimatedPrice.toLocaleString('en-IN')}`);
      } else if (response.estimatedRent) {
        toast.success(`Estimated Rent Price: ₹${response.estimatedRent.toLocaleString('en-IN')}`);
      } else {
        toast(response.message || "Could not estimate price for this property.");
      }
    } catch (error) {
      toast.error(`Error estimating price: ${error.response?.data?.message || error.message}`);
    }
  };




  // ===== COMPARE TOGGLE =====
  const handleComparisonToggle = async (event) => {
    event.stopPropagation();
    if (!currentUser) return navigate("/login");

    try {
      if (isCompared) {
        await removeProperty(propertyId);
      } else {
        await addProperty(propertyPayload);
      }
    } catch (err) {
      console.error("Comparison error:", err);
      alert("Unable to update comparison list right now.");
    }
  };

  // ===== LIKE/SAVE TOGGLE =====
  const handleToggleLike = async (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (!currentUser) return navigate("/login");

    try {
      await toggleSaved(propertyId); // handled entirely by context
    } catch (err) {
      console.error("Save toggle error:", err);
    }
  };

  // ===== STATUS BADGES =====
  const getStatusBadge = () => {
    switch (status) {
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

  const liked = isSaved(propertyId); // REAL TIME STATE FROM CONTEXT

  return (
    <div className="group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-white">

      {/* Image Section */}
      <div className="relative">
        <div className="aspect-video overflow-hidden">
          <img
            src={primaryImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => (e.target.src = "/placeholder.jpg")}
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
          onClick={handleToggleLike}
          aria-pressed={liked}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-1 rounded-full hover:bg-white transition-colors"
          title={liked ? "Remove saved" : "Save property"}
        >
          <Heart className={`h-4 w-4 ${liked ? "text-red-500 fill-current" : "text-gray-500"}`} />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <div className="flex items-center text-gray-500 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{locationString}</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">₹{price ? Number(price).toLocaleString('en-IN') : 'N/A'}</p>
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

        {/* Lister Details */}
        {lister && (
          <div className="flex items-center gap-3 mb-4 p-2 bg-gray-50 rounded-lg border border-gray-100">
            <img
              src={lister.photo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(lister.name)}
              alt={lister.name}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
              onError={(e) => (e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(lister.name))}
            />
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-gray-900 truncate">{lister.name}</span>
              <span className="text-xs text-gray-500 truncate">{lister.email}</span>
              {lister.phone && <span className="text-xs text-gray-400">{lister.phone}</span>}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={handleViewDetails}
            className="w-full flex items-center justify-center gap-2 border border-blue-600 text-blue-600 rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors"
          >
            <Eye className="h-4 w-4" />
            View Details
          </button>

          <button
            onClick={handleComparisonToggle}
            className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors ${isCompared
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            disabled={isUpdating}
          >
            <GitCompare className="h-4 w-4" />
            {isCompared ? "In Compare" : "Compare"}
          </button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row mt-2">
          <button
            onClick={handleEstimatePrice}
            className="w-full flex items-center justify-center gap-2 border border-purple-600 text-purple-600 rounded-lg px-4 py-2 hover:bg-purple-50 transition-colors"
          >
            Estimate Price
          </button>
        </div>
      </div>
    </div>
  );
}