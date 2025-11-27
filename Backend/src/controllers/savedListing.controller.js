import mongoose from "mongoose";
import { SavedListing } from "../models/savedListing.models.js";
import { Property } from "../models/property.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Save listing
const saveUserListing = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { listingId: propertyId, notes } = req.body;

    if (!propertyId) {
        throw new ApiError(400, "Property ID is required.");
    }

    // 1. Check property exists
    const propertyExists = await Property.findById(propertyId);
    if (!propertyExists) {
        throw new ApiError(404, "Property not found");
    }

    // 2. Prevent duplicate saves
    const alreadySaved = await SavedListing.findOne({
        userId: userId,
        listingId: propertyId
    });

    if (alreadySaved) {
        return res.status(200).json(new ApiResponse(200, alreadySaved, "Listing was already saved."));
    }

    // 3. Create saved listing
    const saved = await SavedListing.create({
        userId: userId,
        listingId: propertyId,
        notes: notes || ""
    });

    res.status(201).json(
        new ApiResponse(201, saved, "Listing saved successfully")
    );
});

// Remove saved listing
const removeSavedListing = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { propertyId } = req.params;

    const deleted = await SavedListing.findOneAndDelete({
        userId: userId,        // <-- Ensure userId is used in query
        listingId: propertyId
    });

    if (!deleted) {
        throw new ApiError(404, "Saved listing not found");
    }

    res.status(200).json(
        new ApiResponse(200, null, "Listing removed successfully.")
    );
});

// Get all saved listings
const getSavedListings = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const saved = await SavedListing.find({
        userId: userId          // <-- Ensure userId is used in query
    })
        .populate({
            path: "listingId",
        })
        .sort({ createdAt: -1 });

    res.status(200).json(
        new ApiResponse(200, saved, "Fetched saved listings")
    );
});

// Get all saved listing IDs
const getSavedListingIds = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const savedListingIds = await SavedListing.find({ userId }).select('listingId -_id');

    res.status(200).json(
        new ApiResponse(200, savedListingIds.map(item => item.listingId), "Fetched saved listing IDs")
    );
});

export {
    saveUserListing,
    removeSavedListing,
    getSavedListings,
    getSavedListingIds
};
