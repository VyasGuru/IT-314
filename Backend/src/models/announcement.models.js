import mongoose from "mongoose";

const ANNOUNCEMENT_PRIORITIES = ["normal", "high", "urgent"];
Object.freeze(ANNOUNCEMENT_PRIORITIES);

const announcementSchema = new mongoose.Schema(
    {
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        priority: {
            type: String,
            enum: ANNOUNCEMENT_PRIORITIES,
            default: "normal",
            index: true,
        },
        expiresAt: {
            type: Date,
            default: null,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        createdByName: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

announcementSchema.virtual("isExpired").get(function () {
    if (!this.expiresAt) {
        return false;
    }
    return this.expiresAt.getTime() < Date.now();
});

announcementSchema.index(
    { expiresAt: 1 },
    { partialFilterExpression: { expiresAt: { $type: "date" } } }
);

const Announcement = mongoose.model("Announcement", announcementSchema);

export { Announcement, ANNOUNCEMENT_PRIORITIES };
