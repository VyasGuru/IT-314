import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Listing } from "../models/listing.models.js";
import { User } from "../models/user.models.js";

const verifyListing = asyncHandler(async (req, res) => {
    const { listingId } = req.params;
    const adminId = req.user._id;

    if (!listingId) {
        throw new ApiError(400, "Listing ID is required");
    }

    const listing = await Listing.findById(listingId);

    if (!listing) {
        throw new ApiError(404, "Listing not found");
    }

    listing.status = "verified";
    listing.verifiedAt = new Date();
    listing.verifiedByAdminUid = adminId;

    await listing.save();

    res.status(200).json(
        new ApiResponse(200, listing, "Listing verified successfully")
    );
});

export { verifyListing };