const mongoose = require('mongoose');

const propertyComparisonSchema = new mongoose.Schema({
  comparison_id: { type: String, unique: true, required: true },
  user_firebase_uid: { type: String, required: true, ref: 'User' },
  property_ids: [{ type: String, ref: 'Property' }],
  created_at: { type: Date, default: Date.now },
});

const PropertyComparison = mongoose.model('PropertyComparison', propertyComparisonSchema);

module.exports = PropertyComparison;
