import { Router } from "express";
import { getFilteredProperties,
         createProperty,
         updatePropertyDetails,
         deleteProperty,
         updatePropertyStatus
       } from "../controllers/property.controller.js";

import { verifyFirebaseToken, verifyLister } from "../middlewares/authMiddleware.js"; 

import { upload } from "../middlewares/multer.middleware.js";


const router = Router()

// Public route - no authentication required for browsing/searching properties
router.route("/").get(getFilteredProperties)

router.route("/create").post(
    verifyFirebaseToken, 
    verifyLister, 
    upload.array("images", 10), 
    createProperty
);

router.route("/update-details/:propertyId").patch(
    verifyFirebaseToken, 
    verifyLister,
    upload.array("images", 10), 
    updatePropertyDetails
);

router.route("/update-status/:propertyId").patch(
    verifyFirebaseToken, 
    verifyLister, 
    updatePropertyStatus
);

router.route("/delete/:propertyId").delete(
    verifyFirebaseToken, 
    verifyLister, 
    deleteProperty
);

export default router





