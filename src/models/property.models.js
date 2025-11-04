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
    ],

    priceHistory: [
      {
        price: {
          type: String,
          required: true,
        },

        date: {
          type: Date,
          default: Date.now(), //assign current date
        }
      }
    ],

    amenities: {
      parking: { 
        type: Boolean, 
        default: false 
      },

      gym: { 
        type: Boolean, 
        default: false 
      },

      swimmingPool: { 
        type: Boolean, 
        default: false 
      },

      wifi: { 
        type: Boolean, 
        default: false 
      },

      security: { 
        type: Boolean, 
        default: false 
      },

      powerBackup: { 
        type: Boolean, 
        default: false 
      },

      garden: { 
        type: Boolean, 
        default: false 
      },

      lift: { 
        type: Boolean, 
        default: false 
      },

      clubhouse: { 
        type: Boolean, 
        default: false 
      },

      playArea: { 
        type: Boolean, 
        default: false 
      },

      furnished: { 
        type: Boolean, 
        default: false 
      },

    },

  },

  {
    timestamps: true
  }

);

export const Property = mongoose.model("Property", propertySchema);
