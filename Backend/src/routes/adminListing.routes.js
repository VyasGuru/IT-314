import express from "express";
import { deleteListings } from "../controllers/adminListing.controller.js";
import { verifyFirebaseToken, verifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/admin/listings/delete
router.post("/delete", verifyFirebaseToken, verifyAdmin, deleteListings);

export default router;
