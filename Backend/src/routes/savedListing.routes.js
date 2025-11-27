import express from "express";

import {saveUserListing, removeSavedListing, getSavedListings, getSavedListingIds} from "../controllers/savedListing.controller.js";


import {verifyFirebaseToken} from "../middlewares/authMiddleware.js" 

const router = express.Router();


router.use(verifyFirebaseToken); // all routes required first authentication

router.post("/", saveUserListing);  // POST /api/saved-listings
router.delete("/:propertyId", removeSavedListing);  // DELETE /api/saved-listings/:propertyId
router.get("/", getSavedListings);  // GET /api/saved-listings
router.get("/ids", getSavedListingIds); // GET /api/saved-listings/ids


export default router;


