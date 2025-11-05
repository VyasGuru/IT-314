import { Property } from "../models/property.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getFilteredProperties = asyncHandler(async (req, res) => {

    try {
        const { minPrice, maxPrice, location, minSize, maxSize, bedrooms, bathrooms, propertyType, area_sqft } = req.query;

        // Create an empty filter object
        let filter = {};

        // Add filters dynamically
        if (location) {
            filter.location = {     //regex used for find pattern, options = i , for case in sensetive
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

        if(area_sqft){
            filter.size = area_sqft;
        }

        if(year_built){
            filter.yearOfBuild.$lte = year_built;
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

export {
    getFilteredProperties,
}