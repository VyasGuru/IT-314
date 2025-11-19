import express from "express";
import { createAnnouncement, getAnnouncements, deleteAnnouncement } from "../controllers/announcement.controller.js";
import { verifyFirebaseToken, verifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyFirebaseToken, verifyAdmin, createAnnouncement);
router.get("/", getAnnouncements);
router.delete("/:id", verifyFirebaseToken, verifyAdmin, deleteAnnouncement);

export default router;
