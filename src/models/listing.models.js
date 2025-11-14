import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
        },

        listerFirebaseUid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        status: {
            type: String,
            enum: ["active", "hidden", "pending", "verified", "rejected", "expired"],
            default: "pending",
        },

        viewsCount: {
            type: Number,
            default: 0,
        },

        verifiedAt: {
            type: Date,
        },

        verifiedByAdminUid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        rejectionReason: {
            type: String,
        },

        expiresAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

export const Listing = mongoose.model("Listing", listingSchema);