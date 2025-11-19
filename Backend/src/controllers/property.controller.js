import { Property } from "../models/property.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Listing } from "../models/listing.models.js";
import { Review } from "../models/review.models.js";
import mongoose from "mongoose";
import { createAdminNotification, createListerNotification } from "../services/notification.service.js";
import { recordPropertyUpload, recordStatusChange } from "../services/stats.service.js";

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
        const { minPrice, maxPrice, location, minSize, maxSize, bedrooms, bathrooms, propertyType, year_built, amenities } = req.query;

        // Create an empty filter object
        let filter = {};

        // Add filters dynamically
        if (location) {
            filter["location.city"] = {     //regex used for find pattern, options = i , for case in sensetive
                $regex: location, 
                $options: "i",
            }; 
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice){
                filter.price.$gte = Number(minPrice); //gte = greater than equal to
            }
            if (maxPrice){
                filter.price.$lte = Number(maxPrice); //lte = less than equal to
            }
        }

        if (minSize || maxSize) {
            filter.size = {};
            if (minSize){
                filter.size.$gte = Number(minSize); //convert minSize into number
            } 
            if (maxSize) {
                filter.size.$lte = Number(maxSize);
            }
        }

        if (bedrooms){
            filter.bedrooms = Number(bedrooms);
        } 

        if (bathrooms){
            filter.bathrooms = Number(bathrooms);
        }   

        if(propertyType){
            filter.propertyType = propertyType;
        }

        if(year_built){
            filter.yearBuild = {};
            filter.yearBuild.$lte = Number(year_built);
        }

        if (amenities) {
            // List of valid amenity
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

            // Convert amenities string (e.g., "wifi,gym") into an array
            const selectedAmenities = amenities.split(",").map((a) => a.trim());

            // Filter out valid ones
            const validSelected = selectedAmenities.filter((a) =>
                validAmenities.includes(a)
            );

            // write logiv for or operator, means any one of amenities present then display
            if (validSelected.length > 0) {
                filter.$or = validSelected.map((a) => (
                    {
                        [`amenities.${a}`]: true,
                    }
                ));
            }
        }

        // Fetch filtered properties
        const properties = await Property.find(filter);

        if (properties.length === 0) {
            throw new ApiError(404, "No properties found")
        }

        return res.status(200).json(
            new ApiResponse(200, properties, "Property search Succesfully")
        );

    }

    catch (error) {
        throw new ApiError(500, error.message)
    }

});

// CREATE PROPERTY FUNCTION OF A LISTER
const createProperty = asyncHandler(async (req, res) => {
    // We get all the data first
    const { 
        title, description, yearBuild, propertyType, 
        price, size, bedrooms, bathrooms, balconies, 
        amenities, location
    } = req.body;

    // This check correctly handles '0'
    const requiredFields = [
        title, description, yearBuild, propertyType,
        price, size, bedrooms, bathrooms, balconies,
        amenities, location
    ];
    
    if (requiredFields.some(field => field === undefined || field === null || field === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const images = req.files; 
    if (!images || images.length === 0) {
        throw new ApiError(400, "At least one image is required");
    }

    // We use a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const imageUrls = images.map(file => file.path); 
        const amenitiesObject = JSON.parse(amenities);
        const locationObject = JSON.parse(location);
        
        //  Create the Property
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
            images: imageUrls,
            amenities: amenitiesObject,
            priceHistory: [{
                price: Number(price), 
                reason: "Initial listing"
            }]
        });

        await newProperty.save({ session }); // Save within the transaction

        // Create the Listing
        const newListing = new Listing({
            propertyId: newProperty._id, 
            listerFirebaseUid: req.user._id, 
            status: "pending"            
        });

        await newListing.save({ session }); // Save within the transaction

        // If both worked, commit the changes
        await session.commitTransaction();

        await Promise.allSettled([
            recordPropertyUpload({
                propertyId: newProperty._id,
                listerId: req.user?._id,
                listerName: req.user?.name || req.user?.email,
                title,
            }),
            createAdminNotification({
                title: "New property upload",
                message: `New property uploaded by ${req.user?.name || "Lister"}: \"${title}\"`,
                type: "system",
                metadata: {
                    listerName: req.user?.name,
                    listerId: req.user?._id,
                    propertyTitle: title,
                    propertyId: newProperty._id,
                },
            }),
        ]);

        return res.status(201).json(
            new ApiResponse(201, { newProperty, newListing }, "Property and Listing created successfully")
        );

    } catch (error) {
        // If anything failed, roll back all changes
        await session.abortTransaction();
        
        // TODO: Add logic here to delete the uploaded images from Cloudinary/S3

        throw new ApiError(500, `Transaction failed: ${error.message}`);
    } finally {
        session.endSession();
    }
});

// This correctly updates both the Property and the Listing
const updatePropertyDetails = asyncHandler(async (req, res) => {

    // Get the Property's ID from the URL
    const { propertyId } = req.params; 
    
    // Get all the new data from the form

    const { 
        title, description, yearBuild, propertyType, 
        price, size, bedrooms, bathrooms, balconies, 
        amenities, location
    } = req.body;


    // Find the property and its listing
    const property = await Property.findById(propertyId);
    if (!property) throw new ApiError(404, "Property not found");


    const listing = await Listing.findOne({ propertyId: property._id });
    if (!listing) throw new ApiError(404, "Listing for this property not found");


    // Security Check: Is the user the owner?
    if (listing.listerFirebaseUid.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to edit this property"); 
    }


    let newPriceHistory = [...property.priceHistory]; 
    
    if (price !== null && price !== undefined) {
        const newPrice = Number(price);
        if (isNaN(newPrice) || newPrice < 0) throw new ApiError(400, "Invalid price");
        

        if (newPrice !== property.price) {
            newPriceHistory.push({
                price: newPrice,
                reason: "Lister updated price"
            });
            property.price = newPrice;
        }
    }

    // Update fields (This version safely handles '0' and nulls)
    if (title !== null && title !== undefined) {
        if(title.trim() === "") throw new ApiError(400, "Title cannot be empty");
        property.title = title;
    }

    if (description !== null && description !== undefined) {
        property.description = description;
    }

    if (yearBuild !== null && yearBuild !== undefined) {
        const numYear = Number(yearBuild);
        if (isNaN(numYear) || numYear < 1000) throw new ApiError(400, "Invalid year");
        property.yearBuild = numYear;
    }

    if (propertyType !== null && propertyType !== undefined) {
        property.propertyType = propertyType;
    }

    if (size !== null && size !== undefined) {
        const numSize = Number(size);
        if (isNaN(numSize) || numSize < 0) throw new ApiError(400, "Invalid size");
        property.size = numSize;
    }

    if (bedrooms !== null && bedrooms !== undefined) {
        const numBedrooms = Number(bedrooms);
        if (isNaN(numBedrooms) || numBedrooms < 0) throw new ApiError(400, "Invalid bedrooms");
        property.bedrooms = numBedrooms;
    }

    if (bathrooms !== null && bathrooms !== undefined) {
        const numBathrooms = Number(bathrooms);
        if (isNaN(numBathrooms) || numBathrooms < 0) throw new ApiError(400, "Invalid bathrooms");
        property.bathrooms = numBathrooms;
    }

    if (balconies !== null && balconies !== undefined) {
        const numBalconies = Number(balconies);

        if (isNaN(numBalconies) || numBalconies < 0) throw new ApiError(400, "Invalid balconies");
        property.balconies = numBalconies;
    }

    // Safely parse JSON
    try {
        if (amenities !== undefined && amenities !== null) {
            property.amenities = JSON.parse(amenities);
        }
        if (location !== undefined && location !== null) {
            property.location = JSON.parse(location);
        }
    } catch (parseError) {
        throw new ApiError(400, "Invalid JSON format for amenities or location");
    }

    // Final updates
    property.priceHistory = newPriceHistory; 
    listing.status = "pending"; // Force re-verification

    // Save
    const updatedProperty = await property.save();
    const updatedListing = await listing.save();

    return res.status(200).json(
        new ApiResponse(200, { updatedProperty, updatedListing }, "Property updated, pending re-verification")
    );

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
    if (listing.listerFirebaseUid.toString() !== req.user._id.toString()) {
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

    // Get the Property's _id from the URL
    const { propertyId } = req.params; 

    const property = await Property.findById(propertyId);
    if (!property) throw new ApiError(404, "Property not found");

    const listing = await Listing.findOne({ propertyId: property._id });
    if (!listing) throw new ApiError(404, "Listing for this property not found");

    // Security Check
    if (listing.listerFirebaseUid.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can't delete this property");
    }

    // Delete Images
    const imageUrls = property.images || [];
    if (imageUrls.length > 0) {
        console.log(`TODO: Delete ${imageUrls.length} images from cloud storage.`);
    }

    //  Delete Reviews 
    const propertyIdString = property._id.toString();
    
    await Review.deleteMany({ 
        target_id: propertyIdString,
        target_type: "property" 
    });

    // delete the database records 
    await Property.findByIdAndDelete(propertyId);
    await Listing.findByIdAndDelete(listing._id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Property, listing, and reviews deleted")
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

export {
    getFilteredProperties,
    createProperty,
    updatePropertyDetails,
    updatePropertyStatus,
    deleteProperty,
    reviewPropertyStatus,
}
