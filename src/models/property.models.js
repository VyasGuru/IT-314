// models/property.model.js
import mongoose from "mongoose";

const priceHistorySchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: true,
    },

    changedAt: {
      type: Date,
      default: Date.now(), //assign current date
    },

    reason: {
      type: String,
    },
  }
);


const locationSchema = new mongoose.Schema(

  {

    street: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    zipCode: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    latitude: {
      type: Number,
    },

    longitude: {
      type: Number,
    },

  },

);

const propertySchema = new mongoose.Schema(
  {

    title: {
      type: String,
      required: true,
    },
    
    location: {
      type: locationSchema,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    yearBuild: {
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

    documents: [
      {
        type: String,
      }
    ],

    priceHistory: [
      {
        type: priceHistorySchema,
      },
    ],

    amenities: {
      
      parking: {
        type: Boolean,
        default: false,
      },

      gym: {
        type: Boolean,
        default: false,
      },

      swimmingPool: {
        type: Boolean,
        default: false,
      },

      wifi: {
        type: Boolean,
        default: false,
      },

      security: {
        type: Boolean,
        default: false,
      },

      powerBackup: {
        type: Boolean,
        default: false,
      },

      garden: {
        type: Boolean,
        default: false,
      },

      lift: {
        type: Boolean,
        default: false,
      },

      clubhouse: {
        type: Boolean,
        default: false,
      },

      playArea: {
        type: Boolean,
        default: false,
      },

      furnished: {
        type: Boolean,
        default: false,
      },

    },

  },

  {
    timestamps: true,
  }

);

export const Property = mongoose.model("Property", propertySchema);
