const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  price: { type: Number, required: true },
  changed_at: { type: Date, default: Date.now },
  reason: { type: String },
});

const locationSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip_code: { type: String, required: true },
  country: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
});

const propertySchema = new mongoose.Schema({
  property_id: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  property_type: { type: String, enum: ['residential', 'commercial', 'land', 'rental'], required: true },
  current_price: { type: Number, required: true },
  price_history: [priceHistorySchema],
  location: { type: locationSchema, required: true },
  bedrooms: { type: Number },
  bathrooms: { type: Number },
  area_sqft: { type: Number },
  year_built: { type: Number },
  amenities: [String],
  images: [String],
  documents: [String],
  virtual_tour_url: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
