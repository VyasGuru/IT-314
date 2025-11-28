import express from "express";

import {
    registerUser,
    loginUser,
    googleLogin,
    logoutUser,
    getProfile,
    resetPassword,
    forgetPassword,
    updateUserDetails,
    sendEmailVerification,
    verifyEmail,
    resetEmailVerification,
} from "../controllers/user.controller.js";

import { verifyFirebaseToken } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
// Login route doesn't need verifyFirebaseToken middleware as it verifies the token itself
router.post("/login", loginUser);
router.post("/google-login", googleLogin);

router.post("/logout", verifyFirebaseToken, logoutUser);
router.get("/profile", verifyFirebaseToken, getProfile);
router.post("/reset-password", verifyFirebaseToken, resetPassword);
router.post("/forgot-password", forgetPassword);
router.patch("/update", verifyFirebaseToken, upload.single("photo"), updateUserDetails);

// Email verification routes
router.post("/send-verification-email", verifyFirebaseToken, sendEmailVerification);
router.post("/verify-email", verifyEmail);
router.post("/reset-email-verification", resetEmailVerification);

export default router;