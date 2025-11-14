const mongoose = require('mongoose');

const savedListingSchema = new mongoose.Schema({
  saved_id: { type: String, unique: true, required: true },
  user_firebase_uid: { type: String, required: true, ref: 'User' },
  listing_id: { type: String, required: true, ref: 'Listing' },
  notes: { type: String },
  saved_at: { type: Date, default: Date.now },
});

const SavedListing = mongoose.model('SavedListing', savedListingSchema);

module.exports = SavedListing;
