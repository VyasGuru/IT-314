import mongoose from "mongoose";

const verificationDocumentSchema = new mongoose.Schema(
    {
        userFirebaseUid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        documentType: {
            type: String,
            enum: ["identity_proof", "property_ownership", "business_license"],
            required: true,
        },

        documentUrl: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending",
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
    },
    {
        timestamps: true,
    }
);

export const VerificationDocument = mongoose.model("VerificationDocument", verificationDocumentSchema);