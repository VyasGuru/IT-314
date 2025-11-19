import mongoose from "mongoose";

const recentUploadSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
        },
        title: String,
        listerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        listerName: String,
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const dailyStatsSchema = new mongoose.Schema(
    {
        dateKey: {
            type: String,
            required: true,
            unique: true,
        },
        newProperties: {
            type: Number,
            default: 0,
        },
        approved: {
            type: Number,
            default: 0,
        },
        pending: {
            type: Number,
            default: 0,
        },
        rejected: {
            type: Number,
            default: 0,
        },
        totalUploads: {
            type: Number,
            default: 0,
        },
        lastReset: {
            type: Date,
            default: Date.now,
        },
        recentUploads: {
            type: [recentUploadSchema],
            default: [],
        },
    },
    { timestamps: true }
);

const DailyStats = mongoose.model("DailyStats", dailyStatsSchema);

export { DailyStats };
