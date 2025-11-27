import {PropertyComparison} from "../models/propertyComparison.models.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";


//add a property for comparison
const addPropertyToComparison = asyncHandler(async (req, res) => {

    const userId = req.user._id;
    const { propertyId } = req.body;

    if(!propertyId){
        throw new ApiError(400, "Property ID is required");
    }


    //check for user comparison array
    try {

        let comparison = await PropertyComparison.findOne({userFirebaseUid: userId});

        if(!comparison){

            //create new array
            comparison = await PropertyComparison.create(
                {
                    userFirebaseUid: userId,
                    propertyIds: [propertyId],
                }
            );
        }
        else{

            //avoid duplicate
            if(comparison.propertyIds.includes(propertyId)){
                throw new ApiError(400, "Property already added for comparison");
            }


            //include it
            comparison.propertyIds.push(propertyId);
            await comparison.save();
        }

        res.status(200).json(
            new ApiResponse(200, comparison, "Property added for comparison successfully")
        );
    }

    catch(err){
        throw new ApiError(400, `Error while adding property to comparison. \n Error is : ${err.message}`);
    }

});


// Remove one property from comparison

const removePropertyFromComparison = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { propertyId } = req.params;

    try {
        const comparison = await PropertyComparison.findOne({userFirebaseUid: userId});
    
        if(!comparison){
            throw new ApiError(404, "Comparison not found for this user");
        }
    
        //update comparison array
        comparison.propertyIds = comparison.propertyIds.filter(
            (id) => id.toString() !== propertyId
        );
    
        await comparison.save();
    
        res.status(200).json(
            new ApiResponse(200, comparison, "Property removed from comparison successfully")
        );

    } 
    
    catch (err) {
        throw new ApiError(400, `Error while remove property from comparison. \n Error is ${err.message}`);
    }
});


//get comparison properties
const getComparedProperties = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    try {

        const comparison = await PropertyComparison.findOne({userFirebaseUid: userId}).populate("propertyIds"); //get full imformation of property
    
        // Return empty array
        if(!comparison || comparison.propertyIds.length === 0){
            return res.status(200).json(
                new ApiResponse(200, [], "No properties selected for comparison")
            );
        }
    
        // fronted handle less than 2 case
        res.status(200).json(
            new ApiResponse(200, comparison.propertyIds, "Comparison properties retrieved successfully")
        );

    } 
    
    catch (err) {
        throw new ApiError(400, `Error while find comparison property. \n Error is : ${err.message}`);
    }

});


// clear all
const clearComparison = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    
    try {
        await PropertyComparison.findOneAndDelete({userFirebaseUid: userId});

        res.status(200).json(
            new ApiResponse(200, null, "All compared properties cleared")
        );
    } 
    
    catch (err) {
        throw new ApiError(400, `Error while clearing property. \n Error is : ${err.message}`);
    }

});


export{
    addPropertyToComparison,
    removePropertyFromComparison,
    getComparedProperties,
    clearComparison
};