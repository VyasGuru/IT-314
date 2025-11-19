import express from "express";
import {
    notifyLister,
    getUserNotifications,
    getAdminNotifications,
    markAsRead,
} from "../controllers/notification.controller.js";
import {
    verifyFirebaseToken,
    verifyAdmin,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin endpoints
router.post("/admin/listers", verifyFirebaseToken, verifyAdmin, notifyLister);
router.get("/admin", verifyFirebaseToken, verifyAdmin, getAdminNotifications);
router.patch("/admin/:id/read", verifyFirebaseToken, verifyAdmin, markAsRead);

// Per-user endpoints
router.get("/me", verifyFirebaseToken, getUserNotifications);
router.get("/users/:userId", verifyFirebaseToken, verifyAdmin, getUserNotifications);
router.patch("/me/:id/read", verifyFirebaseToken, markAsRead);

export default router;
