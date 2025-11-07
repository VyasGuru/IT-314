import { SavedListing } from "../models/savedListing.models.js";
import { Listing } from "../models/listing.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


//save listing
const save = asyncHandler( async (req, res) => {

    //for below action first middle checked if user is loggin or not , that not check at
    //if middle exicute then it's attch user in req and then we access req.user
    const userId = req.user._id;  //for this action first middle checked if user is loggin or not, that not check at





    const { listingId, notes } = req.body;

    //check for listing exists
    const listingExists = await Listing.findById(listingId);

    if(!listingExists){
        throw new ApiError(404, "Listing not found");
    }


    //prevent dublicate save
    const alreadySaved = await SavedListing.findOne(
        {
            userFirebaseUid: userId,
            listingId,
        }
    );


    if(alreadySaved){
        throw new ApiError(400, "Listing already saved");
    }

    //saved 
    const saved = await SavedListing.create(
        {
            userFirebaseUid: userId,
            listingId,
            notes: notes || "",
        }
    );

    res.status(201).json(
        new ApiResponse(201, saved, "Listing saved successfully")
    );

    
});
