import express from "express";
import {
  classifySingleReview,
  listReviews,
  deleteReviewById,
  deleteAllAbusive
} from "./adminController.js";
import { registerAdmin, loginAdmin } from "./adminController.js";

import { checkAdmin } from "./authMiddleware.js";

const router = express.Router();

router.post("/reviews/classify", classifySingleReview);
// admin auth
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/reviews", checkAdmin, listReviews);
router.delete("/reviews/:id", checkAdmin, deleteReviewById);
router.delete("/reviews", checkAdmin, deleteAllAbusive);

export default router;
