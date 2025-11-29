import express from "express";
import { verifyListing } from "../controllers/adminListing.controller.js";
import { verifyAdmin, verifyFirebaseToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.patch(
    "/:listingId/verify",
    verifyFirebaseToken,
    verifyAdmin,
    verifyListing
);

export default router;
