const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  review_id: { type: String, unique: true, required: true },
  reviewer_firebase_uid: { type: String, required: true, ref: 'User' },
  target_type: { type: String, enum: ['property', 'lister'], required: true },
  target_id: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
