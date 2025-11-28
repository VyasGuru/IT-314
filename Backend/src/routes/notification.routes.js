import express from "express";
import {
    notifyLister,
    getUserNotifications,
    getAdminNotifications,
    markAsRead,
    sendToAdmin,
} from "../controllers/notification.controller.js";
import {
    verifyFirebaseToken,
    verifyAdmin,
    attachFirebaseUser,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin endpoints
router.post("/admin/listers", verifyFirebaseToken, verifyAdmin, notifyLister);
router.get("/admin", verifyFirebaseToken, verifyAdmin, getAdminNotifications);
router.patch("/admin/:id/read", verifyFirebaseToken, verifyAdmin, markAsRead);

// Per-user endpoints
// User can send a message/query to admin (auth optional)
router.post("/to-admin", attachFirebaseUser, sendToAdmin);

router.get("/me", verifyFirebaseToken, getUserNotifications);
router.get("/users/:userId", verifyFirebaseToken, verifyAdmin, getUserNotifications);
router.patch("/me/:id/read", verifyFirebaseToken, markAsRead);

export default router;
