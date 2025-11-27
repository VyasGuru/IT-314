import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Review } from "../models/review.models.js";
import { Property } from "../models/property.models.js";

// Submit a review
const submitReview = asyncHandler(async (req, res) => {
    try {
        const { propertyId, rating, comment } = req.body;
        const reviewerId = req.user._id;

       
        if (!propertyId || !rating) {
            throw new ApiError(400, "Property ID and rating are required");
        }

   
        if (rating < 1 || rating > 5) {
            throw new ApiError(400, "Rating must be between 1 and 5");
        }

      
        const property = await Property.findById(propertyId);
        if (!property) {
            throw new ApiError(404, "Property not found");
        }

       
        const existingReview = await Review.findOne({
            reviewerId,
            targetType: "property",
            targetId: propertyId.toString()
        });

        if (existingReview) {
            throw new ApiError(400, "You have already reviewed this property.");
        }

        
        const review = await Review.create({
            reviewerId,
            targetType: "property",
            targetId: propertyId.toString(),
            rating,
            comment: comment || ""
        });

        // Populate reviewer information
        await review.populate("reviewerId", "name email photo");

        res.status(201).json(
            new ApiResponse(201, review, "Review submitted successfully")
        );
    } 
    
    catch (err) {
        throw new ApiError(500, `Error while submitting review. Error is: ${err.message}`);
    }
});

// Get all reviews
const getPropertyReviews = asyncHandler(async (req, res) => {
    try {
        const { propertyId } = req.params;

        if (!propertyId) {
            throw new ApiError(400, "Property ID is required");
        }

       
        const property = await Property.findById(propertyId);
        if (!property) {
            throw new ApiError(404, "Property not found");
        }

    
        const reviews = await Review.find({
            targetType: "property",
            targetId: propertyId.toString()
        })
        .populate("reviewerId", "name email photo")
        .sort({ createdAt: -1 }); // Sort by newest first

        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
        const totalReviews = reviews.length;

        res.status(200).json(
            new ApiResponse(200, {
                reviews,
                averageRating: parseFloat(averageRating),
                totalReviews
            }, "Reviews retrieved successfully")
        );

    } 
    
    catch (err) {
        throw new ApiError(500, `Error while fetching reviews. Error is: ${err.message}`);
    }
});

export {
    submitReview,
    getPropertyReviews
};

