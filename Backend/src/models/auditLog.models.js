import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        userFirebaseUid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        action: {
            type: String,
            required: true,
        },

        resourceType: {
            type: String,
        },

        resourceId: {
            type: String,
        },

        metadata: {
            type: Object,
        },
    },
    {
        timestamps: true,
    }
);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);