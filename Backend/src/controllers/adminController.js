// admin controllers

import { classifyReviewWithLLM } from "./moderationService.js";
import { Review } from "../models/review.models.js";
import { Admin } from "../models/admin.models.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "replace_this_with_strong_secret";

// register new admin
export async function registerAdmin(req, res) {
  // TODO: This function is not working because the User model does not have username and password fields.
  // This needs to be updated to work with the User model and Firebase authentication.
  res.status(500).json({ message: "This feature is not implemented yet." });
  /*
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "username and password required" });

    const existing = await Admin.findOne({ username });
    if (existing) return res.status(400).json({ message: "Admin already exists" });

    const admin = new Admin({ username, password });
    await admin.save();

    res.status(201).json({ message: "Admin created", admin: { id: admin._id, username: admin.username } });
  } catch (err) {
    console.error("Error registering admin:", err);
    res.status(500).json({ message: "Error registering admin", error: err.message });
  }
  */
}

// login admin and issue token
export async function loginAdmin(req, res) {
  // TODO: This function is not working because the User model does not have username and password fields.
  // This needs to be updated to work with the User model and Firebase authentication.
  res.status(500).json({ message: "This feature is not implemented yet." });
  /*
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "username and password required" });

    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const match = await admin.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: admin.role, username: admin.username }, JWT_SECRET, { expiresIn: "2h" });

    res.json({ message: "Authenticated", token });
  } catch (err) {
    console.error("Error logging in admin:", err);
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
  */
}

// classify a review and store it
export async function classifySingleReview(req, res) {
  try {
    const { comment, targetType, targetId, reviewerFirebaseUid, rating } = req.body;

    // basic validation
    if (!comment || comment.trim().length === 0) return res.status(400).json({ message: "Comment required" });
    if (!targetType || !targetId || !reviewerFirebaseUid) {
      return res.status(400).json({ message: "targetType, targetId, reviewerFirebaseUid required" });
    }

    // call moderation check
    const result = await classifyReviewWithLLM(comment);

    // persist review
    const newReview = new Review({
      comment: comment.trim(),
      targetType,
      targetId,
      reviewerFirebaseUid,
      rating: rating || 5,
      isAbusive: result.isAbusive
    });

    const savedReview = await newReview.save(); // Get the result of save()
    res.status(201).json({
    message: "Review saved", 
    review: savedReview,  // Use the returned saved document
    moderation: result
});
  } catch (error) {
    console.error("Error classifying review:", error);
    res.status(500).json({ message: "Error processing review", error: error.message });
  }
}

// list reviews
export async function listReviews(req, res) {
  try {
    const reviews = await Review.find();
    res.json({ count: reviews.length, reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
}

// delete one review
export async function deleteReviewById(req, res) {
  try {
    const { id } = req.params;
    const result = await Review.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: "Review deleted", id });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Error deleting review", error: error.message });
  }
}

//  abusive reviews
export async function deleteAllAbusive(req, res) {
  try {
    const result = await Review.deleteMany({ isAbusive: true });

    res.json({
      message: "Abusive reviews deleted",
      deleted: result.deletedCount
    });
  } catch (error) {
    console.error("Error deleting abusive reviews:", error);
    res.status(500).json({ message: "Error deleting reviews", error: error.message });
  }
}
