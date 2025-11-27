import express from "express";
import {
    submitReview,
    getPropertyReviews
} from "../controllers/review.controller.js";
import { verifyFirebaseToken } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.get("/property/:propertyId", verifyFirebaseToken, getPropertyReviews);
router.post("/", verifyFirebaseToken, submitReview);

export default router;

