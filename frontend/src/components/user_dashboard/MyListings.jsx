import React, { useState } from 'react';
import { Building2, Edit, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { estimatePriceService } from '../../services/priceEstimatorService';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

const MyListings = ({ listings, setListedProperties }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  // Track current image index for each listing by property id
  const [imageIndexes, setImageIndexes] = useState({});
  // Track whether controls are visible (after clicking image) per listing
  const [showControls, setShowControls] = useState({});

  const handleEdit = (id) => {
    navigate(`/my-listings/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const token = await currentUser.getIdToken();
        await axios.delete(`/properties/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const updatedListings = await listings.filter((listing) => listing.property._id !== id);
        await setListedProperties(updatedListings);
      } catch (err) {
        console.error('Error deleting listing:', err);
        alert('Failed to delete listing.');
      }
    }
  };

  const handleToggleControls = (propertyId) => {
    setShowControls((prev) => ({ ...prev, [propertyId]: !prev[propertyId] }));
  };

  const handlePrevImage = (propertyId, images) => {
    setImageIndexes((prev) => {
      const current = prev[propertyId] || 0;
      const next = Math.max(0, current - 1);
      return { ...prev, [propertyId]: next };
    });
  };

  const handleNextImage = (propertyId, images) => {
    setImageIndexes((prev) => {
      const current = prev[propertyId] || 0;
      const next = Math.min(images.length - 1, current + 1);
      return { ...prev, [propertyId]: next };
    });
  };

  const handleAddNewListing = () => {
    navigate('/my-listings/add');
  };

  
  const handleEstimatePrice = async (listingId) => {
    if (!listingId) {
      toast.error("Listing ID not available for price estimation.");
      return;
    }
    try {
      const response = await estimatePriceService(listingId);

      if (response.estimatedPrice) {
        toast.success(`Estimated Selling Price: ₹${response.estimatedPrice.toLocaleString('en-IN')}`);
      } else if (response.estimatedRent) {
        toast.success(`Estimated Rent Price: ₹${response.estimatedRent.toLocaleString('en-IN')}`);
      } else {
        toast(response.message || "Could not estimate price for this listing.");
      }
    } catch (error) {
      toast.error(`Error estimating price: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div>
      {listings.length > 0 && (
        <div className="flex justify-end mb-6">
          <button
            onClick={handleAddNewListing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <Plus size={20} />
            Add New Listing
          </button>
        </div>
      )}

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 size={64} className="text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Listings Yet</h2>
          <p className="text-gray-600 mb-6">Create your first property listing</p>
          <button
            onClick={handleAddNewListing}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold inline-flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <Plus size={20} />
            Add New Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((listing) => (
            <div
              key={listing.listingId}
              className="bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="relative w-full h-48 overflow-hidden">
                {/* Image carousel: show one image at a time */}
                {(() => {
                  const images = Array.isArray(listing.property.images) && listing.property.images.length > 0 ? listing.property.images : ["/placeholder.jpg"];
                  const idx = imageIndexes[listing.property._id] || 0;
                  const src = images[idx];
                  return (
                    <div className="w-full h-48 relative cursor-pointer" onClick={() => handleToggleControls(listing.property._id)}>
                      <img
                        src={src}
                        alt={listing.property.title}
                        className="w-full h-48 object-cover transition-transform duration-300"
                      />
                      {/* Left/Right arrows shown when controls are toggled on */}
                      {showControls[listing.property._id] && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePrevImage(listing.property._id, images); }}
                            disabled={idx === 0}
                            className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 rounded-full p-2 shadow ${idx === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white'}`}
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="h-5 w-5 text-gray-700" />
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); handleNextImage(listing.property._id, images); }}
                            disabled={idx >= images.length - 1}
                            className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 rounded-full p-2 shadow ${idx >= images.length - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white'}`}
                            aria-label="Next image"
                          >
                            <ChevronRight className="h-5 w-5 text-gray-700" />
                          </button>
                        </>
                      )}
                    </div>
                  );
                })()}

                <span
                  className={`absolute top-4 right-4 px-4 py-2 rounded-full text-xs font-semibold uppercase bg-white shadow-md border-2 ${
                    listing.status === 'active' || listing.status === 'verified'
                      ? 'text-green-600 border-green-600'
                      : 'text-amber-600 border-amber-600'
                  }`}
                >
                  {listing.status}
                </span>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex-1">
                    {listing.property.title}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(listing.property._id)}
                      className="w-9 h-9 rounded-lg bg-gray-100 text-blue-600 flex items-center justify-center transition-all duration-300 hover:bg-blue-100 hover:scale-110"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(listing.property._id)}
                      className="w-9 h-9 rounded-lg bg-gray-100 text-red-600 flex items-center justify-center transition-all duration-300 hover:bg-red-100 hover:scale-110"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-2xl font-bold text-blue-600 mb-3">
                  ₹{listing.property.price.toLocaleString('en-IN')}
                </p>

                
                <button
                  onClick={() => handleEstimatePrice(listing.listingId)}
                  className="w-full flex items-center justify-center gap-2 border border-purple-600 text-purple-600 rounded-lg px-4 py-2 hover:bg-purple-50 transition-colors"
                >
                  Estimate Price
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
