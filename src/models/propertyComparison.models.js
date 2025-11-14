import mongoose from "mongoose";

const propertyComparisonSchema = new mongoose.Schema(
    {
        userFirebaseUid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        propertyIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Property",
            },
        ],
    },
    {
        timestamps: true,
    }
);

export const PropertyComparison = mongoose.model("PropertyComparison", propertyComparisonSchema);