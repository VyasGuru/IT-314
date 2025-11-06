import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  listing_id: { type: String, unique: true, required: true },
  property_id: { type: String, required: true, ref: 'Property' },
  lister_firebase_uid: { type: String, required: true, ref: 'User' },
  status: { type: String, enum: ['active', 'hidden', 'pending', 'verified', 'rejected', 'expired'], default: 'pending' },
  views_count: { type: Number, default: 0 },
  verified_at: { type: Date },
  verified_by_admin_uid: { type: String, ref: 'User' },
  rejection_reason: { type: String },
  expires_at: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export const Listing = mongoose.model('Listing', listingSchema);