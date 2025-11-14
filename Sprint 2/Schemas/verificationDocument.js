const mongoose = require('mongoose');

const verificationDocumentSchema = new mongoose.Schema({
  document_id: { type: String, unique: true, required: true },
  user_firebase_uid: { type: String, required: true, ref: 'User' },
  document_type: { type: String, enum: ['identity_proof', 'property_ownership', 'business_license'], required: true },
  document_url: { type: String, required: true },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  verified_at: { type: Date },
  verified_by_admin_uid: { type: String, ref: 'User' },
  rejection_reason: { type: String },
  created_at: { type: Date, default: Date.now },
});

const VerificationDocument = mongoose.model('VerificationDocument', verificationDocumentSchema);

module.exports = VerificationDocument;
