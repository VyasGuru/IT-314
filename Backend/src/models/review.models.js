import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        reviewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        targetType: {
            type: String,
            enum: ["property", "lister"],
            required: true,
        },

        targetId: {
            type: String,
            required: true,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        comment: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export const Review = mongoose.model("Review", reviewSchema);