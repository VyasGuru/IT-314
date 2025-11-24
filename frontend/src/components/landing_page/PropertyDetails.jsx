import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, MapPin, Bed, Bath, Square, Calendar, Heart, Share, Phone, Mail, GitCompare, Star, MessageSquare } from "lucide-react";
import { formatLocation } from "../../utils/formatLocation";
import { useComparison } from "../../contexts/ComparisonContext";
import { useAuth } from "../../contexts/AuthContext";
import { useSavedListings } from "../../contexts/SavedListingsContext"; // Import useSavedListings
import { submitReview, getPropertyReviews } from "../../services/reviewApi";

export function PropertyDetails({ property, isOpen, onClose }) {
  // Remove local liked state
  // const [liked, setLiked] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: ""
  });
  const [reviewError, setReviewError] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { properties: comparedProperties, addProperty, removeProperty, updatingId } = useComparison();
  const { isSaved, toggleSaved } = useSavedListings(); // Use SavedListingsContext

  if (!property || !isOpen) return null;

  // Format location if it's an object
  const locationString = formatLocation(property.location);
  const propertyId = property._id || property.id;
  const liked = isSaved(propertyId); // Get liked status from context
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

  const handleToggleLike = async () => {
    if (!propertyId) return;
    if (!currentUser) {
      navigate("/login");
      return;
    }
    await toggleSaved(propertyId);
  };

  // Fetch reviews when property details are opened
  useEffect(() => {
    if (isOpen && propertyId) {
      fetchReviews();
    }
  }, [isOpen, propertyId]);

  const fetchReviews = async () => {
    if (!propertyId) return;
    setLoadingReviews(true);
    try {
      const response = await getPropertyReviews(propertyId);
      if (response?.data) {
        setReviews(response.data.reviews || []);
        setAverageRating(response.data.averageRating || 0);
        setTotalReviews(response.data.totalReviews || 0);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      // Don't show error if reviews don't exist yet
      if (error.response?.status !== 404) {
        setReviews([]);
      }
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewClick = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setShowReviewModal(true);
    setReviewForm({ rating: 0, comment: "" });
    setReviewError("");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!propertyId) return;

    if (reviewForm.rating === 0) {
      setReviewError("Please select a rating");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");

    try {
      await submitReview(propertyId, reviewForm.rating, reviewForm.comment);
      setShowReviewModal(false);
      setReviewForm({ rating: 0, comment: "" });
      // Refresh reviews
      await fetchReviews();
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        // Check if it's a duplicate review error
        if (errorMessage.includes("already reviewed")) {
          setReviewError("You have already reviewed this property.");
        } else {
          setReviewError(errorMessage);
        }
      } else {
        setReviewError("Failed to submit review. Please try again.");
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive && onStarClick ? () => onStarClick(star) : undefined}
            className={interactive ? "cursor-pointer" : "cursor-default"}
            disabled={!interactive || submittingReview}
          >
            <Star
              className={`h-5 w-5 ${star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
                }`}
            />
          </button>
        ))}
      </div>
    );
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
            <p className="text-3xl font-bold text-blue-600">₹{property.price ? Number(property.price).toLocaleString('en-IN') : 'N/A'}</p>
            <p className="text-gray-500">{property.propertyType}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleComparisonToggle}
              disabled={isUpdating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isCompared
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              <GitCompare className="h-4 w-4" />
              {isCompared ? "In Compare" : "Add to Compare"}
            </button>
            <button
              onClick={handleReviewClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Review
            </button>
            <button
              onClick={handleToggleLike} // Use the new handler
              className={`p-2 rounded-full border ${liked ? "border-red-500 text-red-500" : "border-gray-300 text-gray-500"}`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
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

        {/* Reviews Section */}
        <hr className="my-6 border-gray-200" />
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Reviews</h3>
              <div className="flex items-center gap-2">
                {renderStars(Math.round(averageRating))}
                <span className="text-sm text-gray-600">
                  {averageRating > 0 ? averageRating.toFixed(1) : "No"} rating
                  {totalReviews > 0 && ` (${totalReviews} ${totalReviews === 1 ? "review" : "reviews"})`}
                </span>
              </div>
            </div>
            <button
              onClick={handleReviewClick}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Write Review
            </button>
          </div>

          {loadingReviews ? (
            <div className="text-center py-8 text-gray-500">Loading reviews...</div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id || review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        {review.reviewerId?.photo ? (
                          <img
                            src={review.reviewerId.photo}
                            alt={review.reviewerId.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-blue-600 font-semibold">
                            {review.reviewerId?.name?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {review.reviewerId?.name || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div>{renderStars(review.rating)}</div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border rounded-lg">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No reviews yet. Be the first to review this property!</p>
            </div>
          )}
        </div>

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

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowReviewModal(false);
                setReviewForm({ rating: 0, comment: "" });
                setReviewError("");
              }}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">Write a Review</h3>
            <form onSubmit={handleReviewSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rating *
                </label>
                {renderStars(reviewForm.rating, true, (star) => {
                  setReviewForm({ ...reviewForm, rating: star });
                })}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  rows="4"
                  placeholder="Share your experience with this property..."
                />
              </div>
              {reviewError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{reviewError}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewForm({ rating: 0, comment: "" });
                    setReviewError("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview || reviewForm.rating === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
