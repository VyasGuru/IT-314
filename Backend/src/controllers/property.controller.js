import { Property } from "../models/property.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Listing } from "../models/listing.models.js";
import { Review } from "../models/review.models.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";
import { createAdminNotification, createListerNotification } from "../services/notification.service.js";
import { recordPropertyUpload, recordStatusChange } from "../services/stats.service.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const mapListingStatusToStats = (status) => {
    if (status === "verified" || status === "active") {
        return "approved";
    }

    if (status === "rejected") {
        return "rejected";
    }

    return "pending";
};


const getFilteredProperties = asyncHandler(async (req, res) => {
    try {
        const {
            minPrice,
            maxPrice,
            location,
            minSize,
            maxSize,
            bedrooms,
            bathrooms,
            propertyType,
            year_built,
            amenities,
            searchTerm,
            search,
            priceRange,
            sortBy
        } = req.query;

        // Create an empty filter object
        let filter = {};

        // Search term filter - search in title, description, and location fields
        const searchQuery = searchTerm || search;
        if (searchQuery) {
            const searchRegex = { $regex: searchQuery, $options: "i" };
            filter.$or = [
                { "title": searchRegex },
                { "description": searchRegex },
                { "location.city": searchRegex },
                { "location.state": searchRegex },
                { "location.street": searchRegex },
                { "location.locality": searchRegex },
                { "location.zipCode": searchRegex },
                { "propertyType": searchRegex }
            ];
        }

        // Location filter (city)
        if (location) {
            filter["location.city"] = {
                $regex: location,
                $options: "i",
            };
        }

        // Price filter - handle both minPrice/maxPrice and priceRange
        if (priceRange) {
            let rangeMin = 0;
            let rangeMax = Infinity;

            switch (priceRange) {
                case "0-100k":
                    rangeMin = 0;
                    rangeMax = 100000;
                    break;
                case "100k-300k":
                    rangeMin = 100001;
                    rangeMax = 300000;
                    break;
                case "300k-500k":
                    rangeMin = 300001;
                    rangeMax = 500000;
                    break;
                case "500k-1m":
                    rangeMin = 500001;
                    rangeMax = 1000000;
                    break;
                case "1m+":
                    rangeMin = 1000001;
                    rangeMax = Infinity;
                    break;
            }

            filter.price = {
                $gte: rangeMin,
                ...(rangeMax !== Infinity && { $lte: rangeMax })
            };
        } else if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) {
                filter.price.$gte = Number(minPrice);
            }
            if (maxPrice) {
                filter.price.$lte = Number(maxPrice);
            }
        }

        // Size filter
        if (minSize || maxSize) {
            filter.size = {};
            if (minSize) {
                filter.size.$gte = Number(minSize);
            }
            if (maxSize) {
                filter.size.$lte = Number(maxSize);
            }
        }

        // Bedrooms filter - handle "5+" case
        if (bedrooms) {
            if (bedrooms === "5+") {
                filter.bedrooms = { $gte: 5 };
            } else {
                filter.bedrooms = Number(bedrooms);
            }
        }

        // Bathrooms filter - handle "4+" case
        if (bathrooms) {
            if (bathrooms === "4+") {
                filter.bathrooms = { $gte: 4 };
            } else {
                filter.bathrooms = Number(bathrooms);
            }
        }

        // Property type filter
        if (propertyType) {
            filter.propertyType = propertyType;
        }

        // Year built filter
        if (year_built) {
            filter.yearBuild = {};
            filter.yearBuild.$lte = Number(year_built);
        }

        // Amenities filter
        if (amenities) {
            const validAmenities = [
                "parking",
                "gym",
                "swimmingPool",
                "wifi",
                "security",
                "powerBackup",
                "garden",
                "lift",
                "clubhouse",
                "playArea",
                "furnished",
            ];
            const selectedAmenities = amenities.split(",").map((a) => a.trim());
            const validSelected = selectedAmenities.filter((a) =>
                validAmenities.includes(a)
            );
            if (validSelected.length > 0) {
                // If search term exists, merge with $or, otherwise create new $or
                if (filter.$or) {
                    // Combine search $or with amenities $or using $and
                    filter.$and = [
                        { $or: filter.$or },
                        {
                            $or: validSelected.map((a) => ({
                                [`amenities.${a}`]: true,
                            }))
                        }
                    ];
                    delete filter.$or;
                } else {
                    filter.$or = validSelected.map((a) => ({
                        [`amenities.${a}`]: true,
                    }));
                }
            }
        }

        // Build query
        let query = Property.find(filter);

        // Sorting
        if (sortBy) {
            switch (sortBy) {
                case "price-low":
                    query = query.sort({ price: 1 });
                    break;
                case "price-high":
                    query = query.sort({ price: -1 });
                    break;
                case "newest":
                    query = query.sort({ yearBuild: -1 });
                    break;
                case "oldest":
                    query = query.sort({ yearBuild: 1 });
                    break;
                case "featured":
                    // Sort by featured first, then by creation date
                    query = query.sort({ featured: -1, createdAt: -1 });
                    break;
                default:
                    // Default sort by creation date (newest first)
                    query = query.sort({ createdAt: -1 });
                    break;
            }
        } else {
            // Default sort by creation date (newest first)
            query = query.sort({ createdAt: -1 });
        }

        const properties = await query.exec();

        // Fetch listings for the returned properties and populate lister info
        const propertyIds = properties.map((p) => p._id);
        const listings = await Listing.find({ propertyId: { $in: propertyIds } }).populate({
            path: "listerFirebaseUid",
            model: "User",
            select: "name email photo phone role"
        });

        // Map listings by propertyId for quick lookup
        const listingMap = {};
        listings.forEach((l) => {
            if (l && l.propertyId) {
                listingMap[l.propertyId.toString()] = l;
            }
        });

        // Attach listing and lister info to each property object returned to the client
        const propertiesWithLister = properties.map((prop) => {
            const listing = listingMap[prop._id.toString()] || null;
            const lister = listing ? listing.listerFirebaseUid : null;
            // Convert Mongoose doc to plain object to allow adding fields
            const propObj = prop.toObject ? prop.toObject() : { ...prop };
            propObj.listing = listing ? {
                _id: listing._id,
                status: listing.status,
                rejectionReason: listing.rejectionReason,
                createdAt: listing.createdAt,
                updatedAt: listing.updatedAt
            } : null;
            propObj.lister = lister ? {
                _id: lister._id,
                name: lister.name,
                email: lister.email,
                photo: lister.photo,
                phone: lister.phone,
                role: lister.role
            } : null;
            return propObj;
        });

        return res.status(200).json(
            new ApiResponse(200, propertiesWithLister, "Property search successfully")
        );

    } catch (error) {
        console.error("Error in getFilteredProperties:", error);
        throw new ApiError(500, "Internal Server Error while fetching properties: " + error.message);
    }
});

// CREATE PROPERTY FUNCTION OF A LISTER
const createProperty = asyncHandler(async (req, res) => {
    // Check if user email is verified
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!user.emailVerified) {
        throw new ApiError(403, "Please verify your email before listing a property");
    }

    const {
        title, description, yearBuild, propertyType,
        price, size, bedrooms, bathrooms, balconies,
        amenities, location
    } = req.body;

    const requiredFields = [title, description, yearBuild, propertyType, price, size, bedrooms, bathrooms, balconies, amenities, location];
    if (requiredFields.some(field => field === undefined || field === null || field === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // 1. Handle Image Uploads
    const imagesLocalPaths = req.files?.map(file => file.path);
    if (!imagesLocalPaths || imagesLocalPaths.length === 0) {
        throw new ApiError(400, "At least one image is required");
    }

    // Upload to Cloudinary
    const uploadedImages = await Promise.all(
        imagesLocalPaths.map(async (localPath) => {
            const response = await uploadOnCloudinary(localPath);
            return response?.url || null;
        })
    );
    const validImageUrls = uploadedImages.filter(url => url !== null);

    if (validImageUrls.length === 0) throw new ApiError(500, "Failed to upload images");

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const amenitiesObject = JSON.parse(amenities);
        const locationObject = JSON.parse(location);

        const newProperty = new Property({
            title,
            location: locationObject,
            description,
            yearBuild: Number(yearBuild),
            propertyType,
            price: Number(price),
            size: Number(size),
            bedrooms: Number(bedrooms),
            bathrooms: Number(bathrooms),
            balconies: Number(balconies),
            images: validImageUrls, // Use the Cloudinary URLs
            amenities: amenitiesObject,
            priceHistory: [{ price: Number(price), reason: "Initial listing" }]
        });

        await newProperty.save({ session });

        const newListing = new Listing({
            propertyId: newProperty._id,
            listerFirebaseUid: req.user._id,
            status: "pending"
        });

        await newListing.save({ session });
        await session.commitTransaction();

        return res.status(201).json(new ApiResponse(201, { newProperty, newListing }, "Property created successfully"));

    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(500, `Transaction failed: ${error.message}`);
    } finally {
        session.endSession();
    }
});

// UPDATE PROPERTY DETAILS FUNCTION OF A LISTER
const updatePropertyDetails = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    const {
        title, description, yearBuild, propertyType,
        price, size, bedrooms, bathrooms, balconies,
        amenities, location
    } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) throw new ApiError(404, "Property not found");

    const listing = await Listing.findOne({ propertyId: property._id });
    if (!listing) throw new ApiError(404, "Listing not found");

    // 1. Handle New Images (If any)
    if (req.files && req.files.length > 0) {
        const imagesLocalPaths = req.files.map(file => file.path);
        const uploadedImages = await Promise.all(
            imagesLocalPaths.map(async (localPath) => {
                const response = await uploadOnCloudinary(localPath);
                return response?.url || null;
            })
        );
        const validImageUrls = uploadedImages.filter(url => url !== null);

        // Append new images to the existing list
        if (validImageUrls.length > 0) {
            property.images.push(...validImageUrls);
        }
    }

    // 2. Update Fields
    let newPriceHistory = [...property.priceHistory];
    if (price && Number(price) !== property.price) {
        newPriceHistory.push({ price: Number(price), reason: "Lister updated price" });
        property.price = Number(price);
    }

    if (title) property.title = title;
    if (description) property.description = description;
    if (yearBuild) property.yearBuild = Number(yearBuild);
    if (propertyType) property.propertyType = propertyType;
    if (size) property.size = Number(size);
    if (bedrooms) property.bedrooms = Number(bedrooms);
    if (bathrooms) property.bathrooms = Number(bathrooms);
    if (balconies) property.balconies = Number(balconies);

    try {
        if (amenities) property.amenities = JSON.parse(amenities);
        if (location) property.location = JSON.parse(location);
    } catch (e) {
        throw new ApiError(400, "Invalid JSON for amenities or location");
    }

    property.priceHistory = newPriceHistory;
    listing.status = "pending"; // Force re-verification on update

    const updatedProperty = await property.save();
    const updatedListing = await listing.save();

    return res.status(200).json(new ApiResponse(200, { updatedProperty, updatedListing }, "Property updated"));
});

const updatePropertyStatus = asyncHandler(async (req, res) => {

    // Get the Property's ID from the URL 
    const { propertyId } = req.params;

    // Get the new status ("active" or "hidden") from the JSON body
    const { status } = req.body;

    // Make sure the lister is only trying to set a valid status
    if (status !== "active" && status !== "hidden") {
        throw new ApiError(400, "Invalid status. Must be 'active' or 'hidden'.");
    }

    // Find the 'Listing' (the advertisement) that matches this Property's ID
    const listing = await Listing.findOne({ propertyId: propertyId });

    // If we can't find an ad for this house, stop.
    if (!listing) {
        throw new ApiError(404, "Listing for this property not found");
    }


    // Security Check: Is the logged-in user the real owner?
    if (listing.listerFirebaseUid.toString() !== req.user.firebaseUid.toString()) {
        throw new ApiError(403, "You can't change this property's status");
    }

    // This is the "hide" feature
    listing.status = status;

    // Save our change to the database
    const updatedListing = await listing.save();

    return res.status(200).json(
        new ApiResponse(200, updatedListing, "Property status updated")
    );

});

//  DELETE PROPERTY FUNCTION OF LISTER
const deleteProperty = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    const { deletionReasons, deletionOtherReason } = req.body || {};

    const property = await Property.findById(propertyId);
    if (!property) throw new ApiError(404, "Property not found");

    const listing = await Listing.findOne({ propertyId: property._id });
    if (!listing) throw new ApiError(404, "Listing for this property not found");

    const reasonsArray = Array.isArray(deletionReasons) ? deletionReasons : [];
    const normalizedReasons = reasonsArray
        .map((reason) => (typeof reason === "string" ? reason.trim() : ""))
        .filter(Boolean);

    if (typeof deletionOtherReason === "string" && deletionOtherReason.trim()) {
        normalizedReasons.push(deletionOtherReason.trim());
    }

    if (normalizedReasons.length > 0) {
        property.deletionReasons = normalizedReasons;
        await property.save({ validateBeforeSave: false });
    }

    // Delete images from Cloudinary using allSettled so one failure doesn't reject everything
    if (property.images && property.images.length > 0) {
        try {
            const deletePromises = property.images.map((imageUrl) => deleteFromCloudinary(imageUrl));
            const results = await Promise.allSettled(deletePromises);
            const failed = results.filter(r => r.status === 'rejected');
            if (failed.length > 0) {
                console.warn(`Some images failed to delete from Cloudinary for property ${propertyId}`, failed.map(f => f.reason?.message || f.reason));
            }
        } catch (err) {
            console.warn(`Unexpected error while deleting images for property ${propertyId}:`, err.message || err);
        }
    }

    // Clean up database (attempt each operation and continue)
    try {
        await Review.deleteMany({ target_id: property._id.toString(), target_type: "property" });
    } catch (err) {
        console.warn(`Failed to delete reviews for property ${propertyId}:`, err.message || err);
    }

    try {
        await Property.findByIdAndDelete(propertyId);
    } catch (err) {
        console.warn(`Failed to delete property ${propertyId}:`, err.message || err);
    }

    try {
        await Listing.findByIdAndDelete(listing._id);
    } catch (err) {
        console.warn(`Failed to delete listing ${listing._id} for property ${propertyId}:`, err.message || err);
    }

    // Verify deletion succeeded (property must not exist)
    const stillExists = await Property.findById(propertyId);
    if (stillExists) {
        // If property still exists, return an error so client can retry or report
        throw new ApiError(500, "Failed to delete property. Please try again.");
    }

    console.log(`Property ${propertyId} and associated data deleted by lister ${req.user?.firebaseUid}`);
    return res.status(200).json(
        new ApiResponse(200, { deletionReasons: normalizedReasons }, "Property, listing, reviews, and images deleted")
    );
});

const reviewPropertyStatus = asyncHandler(async (req, res) => {

    const { propertyId } = req.params;
    const { status, message } = req.body;

    const allowedStatuses = ["approved", "rejected", "pending"];

    if (!allowedStatuses.includes(status)) {
        throw new ApiError(400, "Invalid status. Use: approved, rejected, or pending");
    }

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        throw new ApiError(400, "Invalid property id");
    }

    const property = await Property.findById(propertyId);
    if (!property) {
        throw new ApiError(404, "Property not found");
    }

    const listing = await Listing.findOne({ propertyId: property._id });
    if (!listing) {
        throw new ApiError(404, "Listing for this property not found");
    }

    const previousStatsStatus = mapListingStatusToStats(listing.status);

    const statusMap = {
        approved: "verified",
        rejected: "rejected",
        pending: "pending",
    };

    listing.status = statusMap[status];

    if (status === "approved") {
        listing.verifiedAt = new Date();
        listing.verifiedByAdminUid = req.user?._id;
        listing.rejectionReason = undefined;
    } else if (status === "rejected") {
        listing.verifiedAt = undefined;
        listing.verifiedByAdminUid = req.user?._id;
        listing.rejectionReason = message || "Rejected by admin";
    } else {
        listing.verifiedAt = undefined;
        listing.rejectionReason = undefined;
    }

    const updatedListing = await listing.save();

    await Promise.allSettled([
        recordStatusChange({
            propertyId: property._id,
            oldStatus: previousStatsStatus,
            newStatus: status,
        }),
        createListerNotification({
            toUser: listing.listerFirebaseUid,
            title: `Property ${status}`,
            message:
                message ||
                `Your property "${property.title}" has been ${status} by ${req.user?.name || "an admin"}`,
            type: "listing_update",
            metadata: {
                propertyId: property._id,
                propertyStatus: status,
                reviewedBy: req.user?._id,
            },
        }),
    ]);

    return res.status(200).json(
        new ApiResponse(200, { property, listing: updatedListing }, `Property ${status}`)
    );
});

const getUserListings = asyncHandler(async (req, res) => {
    const listerId = req.user._id;

    if (!listerId) {
        throw new ApiError(400, "User not authenticated");
    }

    const listings = await Listing.find({ listerFirebaseUid: listerId }).populate({
        path: 'propertyId',
        model: 'Property'
    });

    if (!listings || listings.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No listings found for this user"));
    }

    const userListings = listings.map(listing => {
        if (!listing.propertyId) {
            // This can happen if a property is deleted but the listing still exists
            return null;
        }
        return {
            listingId: listing._id,
            status: listing.status,
            rejectionReason: listing.rejectionReason,
            createdAt: listing.createdAt,
            updatedAt: listing.updatedAt,
            property: {
                _id: listing.propertyId._id,
                title: listing.propertyId.title,
                description: listing.propertyId.description,
                price: listing.propertyId.price,
                location: listing.propertyId.location,
                images: listing.propertyId.images,
                propertyType: listing.propertyId.propertyType,
                bedrooms: listing.propertyId.bedrooms,
                bathrooms: listing.propertyId.bathrooms,
                size: listing.propertyId.size,
                yearBuild: listing.propertyId.yearBuild,
            }
        };
    }).filter(Boolean); // Remove null entries

    return res.status(200).json(new ApiResponse(200, userListings, "User listings retrieved successfully"));
});

const getPropertyById = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        throw new ApiError(400, "Invalid property ID");
    }

    const property = await Property.findById(propertyId);
    if (!property) {
        throw new ApiError(404, "Property not found");
    }

    // Fetch listing and populate lister info
    const listing = await Listing.findOne({ propertyId: propertyId }).populate({
        path: "listerFirebaseUid",
        model: "User",
        select: "name email photo phone role"
    });

    // Convert Mongoose doc to plain object to allow adding fields
    const propObj = property.toObject ? property.toObject() : { ...property };
    
    // Attach listing and lister info
    propObj.listing = listing ? {
        _id: listing._id,
        status: listing.status,
        rejectionReason: listing.rejectionReason,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt
    } : null;
    
    propObj.lister = listing && listing.listerFirebaseUid ? {
        _id: listing.listerFirebaseUid._id,
        name: listing.listerFirebaseUid.name,
        email: listing.listerFirebaseUid.email,
        photo: listing.listerFirebaseUid.photo,
        phone: listing.listerFirebaseUid.phone,
        role: listing.listerFirebaseUid.role
    } : null;

    res.status(200).json(new ApiResponse(200, propObj, "Property retrieved successfully"));
});

const getListingByPropertyId = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    const listing = await Listing.findOne({ propertyId: propertyId }).populate({
        path: "listerFirebaseUid",
        select: "name email photo phone role"
    });
    if (!listing) {
        throw new ApiError(404, "Listing not found for this property");
    }
    res.status(200).json(new ApiResponse(200, listing, "Listing found"));
});

export {
    getFilteredProperties,
    getPropertyById,
    createProperty,
    updatePropertyDetails,
    updatePropertyStatus,
    deleteProperty,
    reviewPropertyStatus,
    getUserListings,
    getListingByPropertyId,
}