// middleware/authMiddleware.js


import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import admin from "firebase-admin";
import { User } from "../models/user.models.js";

//admin configration

const serviceAccount = {
  type: process.env.FB_TYPE,
  project_id: process.env.FB_PROJECT_ID,
  private_key_id: process.env.FB_PRIVATE_KEY_ID,
  private_key: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FB_CLIENT_EMAIL,
  client_id: process.env.FB_CLIENT_ID,
  auth_uri: process.env.FB_AUTH_URI,
  token_uri: process.env.FB_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FB_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FB_CLIENT_CERT_URL,
  universe_domain: process.env.FB_UNIVERSE_DOMAIN,
};


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
