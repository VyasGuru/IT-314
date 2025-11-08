import express from "express";

import {saveUserListing, removeSavedListing, getSavedListings} from "../controllers/savedListing.controller.js";


import {verifyFirebaseToken} from "../middlewares/authMiddleware.js" 

const router = express.Router();


router.use(verifyFirebaseToken); // all routes required first authentication

router.post("/", saveUserListing);  // POST /api/saved-listings
router.delete("/:listingId", removeSavedListing);  // DELETE /api/saved-listings/:listingId
router.get("/", getSavedListings);  // GET /api/saved-listings


export default router;


