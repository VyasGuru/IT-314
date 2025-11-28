// middleware/verifyLister.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";

const verifyLister = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    
    if (user.role !== 'lister') {
        throw new ApiError(403, "Only verified listers can perform this action");
    }

    if (user.verificationStatus !== 'verified') {
        throw new ApiError(403, "Please complete your lister verification to add properties", {
            requiresVerification: true,
            verificationStatus: user.verificationStatus
        });
    }

    next();
});

export { verifyLister };