import mongoose from "mongoose";

const savedListingSchema = new mongoose.Schema(
    {
        userId: {                             
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        listingId: {                          
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
        },

        notes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export const SavedListing = mongoose.model("SavedListing", savedListingSchema);
