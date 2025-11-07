import { Property } from "../models/property.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

const createProperty = asyncHandler(async (req, res) => {
    
    const { 
        title, description, yearBuild, propertyType, 
        price, size, bedrooms, bathrooms, balconies, 
        amenities, 
        location   
    } = req.body;

    const images = req.files; 

    if (!images || images.length === 0) {
        throw new ApiError(400, "At least one image is required");
    }
    const imageUrls = images.map(file => file.path); 

    
    const amenitiesObject = JSON.parse(amenities);
    const locationObject = JSON.parse(location);

    
    const newProperty = await Property.create({
        lister: req.user._id, 
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

    if (!newProperty) {
        throw new ApiError(500, "Something went wrong while creating the property");
    }

    return res.status(201).json(
        new ApiResponse(201, newProperty, "Property created successfully, pending verification")
    );
});
export {
    getFilteredProperties,createProperty
}