// middleware/authMiddleware.js


import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

// This is our simulated admin check
const checkAdmin = (req, res, next) => {
  console.log('Checking for admin role...');

  // --- THIS IS NOT SECURE FOR PRODUCTION ---
  // We are just checking for a "header" in the request.
  if (req.headers['x-user-role'] === 'admin') {
    console.log('Admin role confirmed!');
    // The user is an admin! Continue to the next function (the controller).
    next();
  } else {
    console.log('Access denied. Not an admin.');
    // The user is NOT an admin. Send an error and stop.
    res.status(403).json({ message: 'Access Denied: Admin role required.' });
  }
};



export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findOne({ firebaseUid: decodedToken?.firebaseUid });

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user; 
        next(); 
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});


export const verifyLister = asyncHandler(async (req, _, next) => {
   
    const userRole = req.user.role;

    if (userRole !== 'lister') {
        throw new ApiError(403, "Access Denied: You must be a 'lister' to perform this action.");
    }

    next(); 
});

export { checkAdmin, verifyJWT, verifyLister };
