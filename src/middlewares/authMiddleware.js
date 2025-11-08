// middleware/authMiddleware.js


import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import admin from "firebase-admin"


// import serviceAccount from "../db/firebaseServiceAccountKey.json" assert { type: "json" };

//above statement not work in some node module, so for this use below code
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "../models/user.models.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../db/firebaseServiceAccountKey.json"), "utf-8")
);





admin.initializeApp(
    {
        credential: admin.credential.cert(serviceAccount),
    }
);



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


const verifyFirebaseToken = asyncHandler(async (req, _, next) => {

    try{
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")){
            throw new ApiError(401, "No token provided");
        }

        const token = authHeader.split(" ")[1];
        const decoded = await admin.auth().verifyIdToken(token);

        const user = await User.findOne({firebaseUid: decoded.uid});

        req.user = user;
        next();
    }

    catch(err){
        throw new ApiError(401, `Error while verification of token. Error is : ${err.message}`);
    }
});


const verifyLister = asyncHandler(async (req, _, next) => {
   
    const userRole = req.user.role;

    if (userRole !== 'lister') {
        throw new ApiError(403, "Access Denied: You must be a 'lister' to perform this action.");
    }

    next(); 
});

export { 
    checkAdmin, 
    verifyFirebaseToken, 
    verifyLister 
};
