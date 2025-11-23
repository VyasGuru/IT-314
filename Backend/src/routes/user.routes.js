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
} from "../controllers/user.controller.js";

import { verifyFirebaseToken } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login" , loginUser);
router.post("/google-login", googleLogin);

router.post("/logout", verifyFirebaseToken, logoutUser);
router.get("/profile", verifyFirebaseToken, getProfile);
router.post("/reset-password", verifyFirebaseToken, resetPassword);
router.post("/forgot-password", forgetPassword);
router.patch("/update", verifyFirebaseToken, upload.single("photo"), updateUserDetails);

export default router;