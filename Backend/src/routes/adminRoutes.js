import express from "express";
import {
  classifySingleReview,
  listReviews,
  deleteReviewById,
  deleteAllAbusive
} from "../controllers/adminController.js";
import { registerAdmin, loginAdmin } from "../controllers/adminController.js";

import { checkAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/reviews/classify", classifySingleReview);
// admin auth
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/reviews", checkAdmin, listReviews);
router.delete("/reviews/:id", checkAdmin, deleteReviewById);
router.delete("/reviews", checkAdmin, deleteAllAbusive);

export default router;
