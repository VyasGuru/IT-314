const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebase_uid: { type: String, unique: true, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['visitor', 'buyer', 'renter', 'lister', 'admin'], required: true },
  phone: { type: String },
  profile_picture: { type: String },
  verification_status: { type: String, enum: ['pending', 'verified', 'rejected', 'not_submitted'], default: 'not_submitted' },
  two_factor_enabled: { type: Boolean, default: false },
  is_suspended: { type: Boolean, default: false },
  is_banned: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
