import { Router } from "express";
import { getFilteredProperties,
         getPropertyById,
         createProperty,
         updatePropertyDetails,
         deleteProperty,
         updatePropertyStatus,
         getUserListings,
         getListingByPropertyId
       } from "../controllers/property.controller.js";

import { verifyFirebaseToken, verifyLister, isVerifiedLister } from "../middlewares/authMiddleware.js"; 

import { upload } from "../middlewares/multer.middleware.js";


const router = Router()

// Public route - no authentication required for browsing/searching properties
router.route("/").get(getFilteredProperties)

// Specific routes must come before parameterized routes
router.route("/my-listings").get(
    verifyFirebaseToken,
    getUserListings
)

router.route("/listings/by-property/:propertyId").get(getListingByPropertyId);

// Get single property by ID (public route) - must come after specific routes
router.route("/:propertyId").get(getPropertyById)

router.route("/create").post(
    verifyFirebaseToken, 
    isVerifiedLister, 
    upload.array("images", 10), 
    createProperty
);

router.route("/update-details/:propertyId").patch(
    verifyFirebaseToken, 
    isVerifiedLister,
    upload.array("images", 10), 
    updatePropertyDetails
);

router.route("/update-status/:propertyId").patch(
    verifyFirebaseToken, 
    isVerifiedLister, 
    updatePropertyStatus
);

router.route("/delete/:propertyId").delete(
    verifyFirebaseToken, 
    isVerifiedLister, 
    deleteProperty
);

export default router
