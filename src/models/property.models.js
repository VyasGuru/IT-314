// models/property.model.js
import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {

    title: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    yearOfBuild: {
      type: Number,
      required: true,
    },

    propertyType: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    size: {
      type: Number, // in square feet
      required: true,
    },

    bedrooms: {
      type: Number,
      required: true,
    },

    bathrooms: {
      type: Number,
      required: true,
    },

    balconies: {
      type: Number,
      required: true,
    },

    images: [
      {
        type: String,
        required: true
      }
    ],

    videos: [
      {
        type: String,
      }
    ]


  },

  { 
    timestamps: true 
  }
  
);

export const Property = mongoose.model("Property", propertySchema);
