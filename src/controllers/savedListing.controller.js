import { SavedListing } from "../models/savedListing.models.js";
import { Listing } from "../models/listing.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";





//routes and index.js and app.js not connect at








//save listing
const saveUserListing = asyncHandler( async (req, res) => {

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


//remove a saved listing
const removeSavedListing = asyncHandler( async (req, res) => {

    //for below action first middle checked if user is loggin or not , that not check at
    //if middle exicute then it's attch user in req and then we access req.user
    const userId = req.user._id;  //for this action first middle checked if user is loggin or not, that not check at

    const { listingId } = req.params;

    const deleted = await SavedListing.findOneAndDelete(
        {
            userFirebaseUid: userId,
            listingId,
        }
    );

    if(!deleted){
        throw new ApiError(404, "Saved listing not found");
    }

    res.status(200).json(
        new ApiResponse(200, null, "Listing removed successfully.")
    );

});


//get all saved listing

const getSavedListings = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const saved = await SavedListing.find(
        {
            userFirebaseUid: userId,
        }
    ).populate(
        {
            path: "listingId", //First, populate the listingId field in SavedListing (i.e., get the listing details).
            populate: {
                path: "propertyId", //Then, inside each listing, also populate the propertyId field (get the property details).
            },
        }
    ).sort(
        {
            createdAt: -1 //sort in descending order(newest saved listing first)
        }
    );


    res.status(200).json(
        new ApiResponse(200, saved, "Fetched saved listings")
    );

});


export {
    saveUserListing,
    removeSavedListing,
    getSavedListings,
};