import express from "express";

import {saveUserListing, removeSavedListing, getSavedListings} from "../controllers/savedListing.controller.js";

//verification --> 
//import {verifyJWT} from "../middlewares/authMiddleware.js" (discuss with group member then add it)

const router = express.Router();

//(discuss with group member then add it)
//router.use(verifyJWT); // all routes required first authentication

router.post("/", saveUserListing);  // POST /api/saved-listings
router.delete("/:listingId", removeSavedListing);  // DELETE /api/saved-listings/:listingId
router.get("/", getSavedListings);  // GET /api/saved-listings


export default router;


