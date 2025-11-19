// middleware/authMiddleware.js


import fs from "fs";
import path from "path";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import admin from "firebase-admin";
import { User } from "../models/user.models.js";

const REQUIRED_SERVICE_FIELDS = ["project_id", "client_email", "private_key"];

const loadServiceAccount = () => {
  const credentialsPathEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const credentialsPath = credentialsPathEnv
    ? path.isAbsolute(credentialsPathEnv)
      ? credentialsPathEnv
      : path.resolve(process.cwd(), credentialsPathEnv)
    : null;

  if (credentialsPath) {
    try {
      const fileContents = fs.readFileSync(credentialsPath, "utf-8");
      const parsed = JSON.parse(fileContents);
      return parsed;
    } catch (error) {
      throw new Error(`Unable to read Firebase credentials from ${credentialsPath}: ${error.message}`);
    }
  }

  return {
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
};

const serviceAccount = loadServiceAccount();

const missingFields = REQUIRED_SERVICE_FIELDS.filter(
  (field) => !serviceAccount?.[field] || typeof serviceAccount[field] !== "string"
);

if (missingFields.length) {
  throw new Error(
    `Firebase service account configuration is incomplete. Missing: ${missingFields.join(", ")}`
  );
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});



//admin check
function checkAdmin(req, res, next) {
  const auth = req.headers["authorization"] || "";
  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }

  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== "admin") return res.status(403).json({ message: "Admins only" });
    req.user = payload;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}


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

const verifyAdmin = asyncHandler(async (req, _, next) => {

  const userRole = req.user?.role;

  if (userRole !== 'admin') {
    throw new ApiError(403, "Access Denied: You must be an 'admin' to perform this action.");
  }

  next();
});

export { 
  checkAdmin, 
  verifyFirebaseToken, 
  verifyLister,
  verifyAdmin 
};
