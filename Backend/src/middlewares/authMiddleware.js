// middleware/authMiddleware.js

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import admin from "firebase-admin";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

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


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const JWT_SECRET = process.env.JWT_SECRET || "replace_this_with_strong_secret";



// MIDDLEWARES

const verifyFirebaseToken = asyncHandler(async (req, _, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    if (!decoded) {
      throw new ApiError(401, "Invalid token");
    }

    const { uid, email, name } = decoded;

    // Try to find user in MongoDB; if missing create a minimal user record.
    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      // Auto-create user so protected routes work for recently-signed users
      // This mirrors behaviour in loginUser controller
      user = await User.create({
        firebaseUid: uid,
        email,
        name: name || "Unnamed User",
        role: email === ADMIN_EMAIL ? "admin" : "user",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    throw new ApiError(401, `Token verification failed: ${err.message}`);
  }
});

// In authMiddleware.js
const verifyLister = asyncHandler(async (req, res, next) => {
    try {
        // Get the token from the Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "No token provided");
        }

        const token = authHeader.split(" ")[1];
        
        // Verify the Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        if (!decodedToken) {
            throw new ApiError(401, "Invalid or expired token");
        }

        // Find the user in the database
        const user = await User.findOne({ firebaseUid: decodedToken.uid });
        
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Check if the user is a lister
        if (user.role !== "lister") {
            throw new ApiError(403, "Only listers can perform this action");
        }

        // Check if the lister is verified
        if (user.status !== "verified") {
            throw new ApiError(403, "Lister account not verified. Please complete verification to add listings.");
        }

        // Attach the user to the request object
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Lister verification failed");
    }
});

const verifyAdmin = asyncHandler(async (req, _, next) => {
  const userRole = req.user?.role;

  if (userRole !== "admin") {
    throw new ApiError(
      403,
      "Access Denied: You must be an 'admin' to perform this action."
    );
  }

  next();
});

const checkAdmin = (req, res, next) => {
  const auth = req.headers["authorization"] || "";

  if (!auth.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Missing or invalid Authorization header" });
  }

  const token = auth.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }
    req.admin = payload;
    next();
  } catch (err) {
    console.error("Admin auth error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
const isVerifiedLister = asyncHandler(async (req, res, next) => {
    try {
        // Get the user from request (added by verifyFirebaseToken middleware)
        const user = req.user;
        
        // Check if user exists and is a lister
        if (!user || user.role !== 'lister') {
            throw new ApiError(403, 'Only verified listers can create property listings');
        }

        // Check if lister is verified
        if (user.verificationStatus !== 'verified') {
            throw new ApiError(403, 
                'Please complete lister verification before creating listings. ' +
                'Submit your verification documents in your profile settings.'
            );
        }

        // If all checks pass, proceed to the next middleware
        next();
    } catch (error) {
        // Pass any errors to the error handler
        next(error);
    }
});

export { 
    checkAdmin, 
    verifyFirebaseToken, 
    verifyLister,
    verifyAdmin,
    isVerifiedLister
};
