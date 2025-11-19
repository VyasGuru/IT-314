import express from "express";
import {
  submitVerificationRequest,
  getMyVerificationStatus,
  getPendingVerifications,
  getVerificationDetails,
  verifyListerSubmission,
  rejectListerSubmission,
  listAllVerificationRequests,
  listVerificationRecords,
} from "../controllers/listerVerification.controller.js";
import { verifyFirebaseToken, verifyAdmin, verifyLister } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/listers", verifyFirebaseToken, verifyLister, submitVerificationRequest);
router.get("/listers/me", verifyFirebaseToken, verifyLister, getMyVerificationStatus);
router.get("/listers/:id", verifyFirebaseToken, verifyAdmin, getVerificationDetails);

router.get("/admin/pending", verifyFirebaseToken, verifyAdmin, getPendingVerifications);
router.post("/admin/:id/verify", verifyFirebaseToken, verifyAdmin, verifyListerSubmission);
router.post("/admin/:id/reject", verifyFirebaseToken, verifyAdmin, rejectListerSubmission);
router.get("/admin/all", verifyFirebaseToken, verifyAdmin, listAllVerificationRequests);
router.get("/admin/records", verifyFirebaseToken, verifyAdmin, listVerificationRecords);

export default router;
