import {PropertyComparison} from "../models/propertyComparison.models.js";
import {Property} from "../models/property.models.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { compare } from "bcrypt";


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
            await compare.save();

            res.status(200).json(
                new ApiResponse(200, comparison, "Property added for comparison successfully")
            );
        }
    }

    catch(err){
        throw new ApiError(400, `Error while adding property to comparison. \n Error is : ${err.message}`);
    }

});

export{
    addPropertyToComparison,
};