import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userFirebaseUid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        title: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        notificationType: {
            type: String,
            enum: ["system", "listing_update", "message", "verification"],
            required: true,
        },

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const Notification = mongoose.model("Notification", notificationSchema);