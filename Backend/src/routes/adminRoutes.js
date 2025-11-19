import express from "express";
import {
  classifySingleReview,
  listReviews,
  deleteReviewById,
  deleteAllAbusive
} from "../controllers/adminController.js";
import { registerAdmin, loginAdmin } from "../controllers/adminController.js";

import { checkAdmin, verifyFirebaseToken, verifyAdmin } from "../middlewares/authMiddleware.js";
import { reviewPropertyStatus } from "../controllers/property.controller.js";
import { getDailyReport, resetDailyReport } from "../controllers/report.controller.js";

const router = express.Router();

router.post("/reviews/classify", classifySingleReview);
// admin auth
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/reviews", checkAdmin, listReviews);
router.delete("/reviews/:id", checkAdmin, deleteReviewById);
router.delete("/reviews", checkAdmin, deleteAllAbusive);

router.patch(
  "/properties/:propertyId/status",
  verifyFirebaseToken,
  verifyAdmin,
  reviewPropertyStatus
);

router.get(
  "/reports/daily-summary",
  verifyFirebaseToken,
  verifyAdmin,
  getDailyReport
);

router.post(
  "/reports/daily-summary/reset",
  verifyFirebaseToken,
  verifyAdmin,
  resetDailyReport
);

export default router;
