import express from "express";

import {
    registerUser,
    loginUser,
    googleLogin,
    logoutUser,
    getProfile,
    resetPassword,
    forgetPassword,
} from "../controllers/user.controller.js";

import { verifyFirebaseToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login" , loginUser);
router.post("/google-login", googleLogin);

router.post("/logout", verifyFirebaseToken, logoutUser);
router.get("/profile", verifyFirebaseToken, getProfile);
router.post("/reset-password", verifyFirebaseToken, resetPassword);
router.post("/forgot-password", forgetPassword);

export default router;