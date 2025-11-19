import mongoose from "mongoose";

const listerVerificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    aadhaarNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    panNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    address: {
      type: String,
      default: "",
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      index: true,
    },
    pendingVerificationId: {
      type: String,
      default: null,
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    verifiedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const verificationRecordSchema = new mongoose.Schema(
  {
    listerVerification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ListerVerification",
      required: true,
    },
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    action: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    reason: {
      type: String,
    },
    pendingVerificationId: {
      type: String,
    },
    governmentRecordFound: {
      type: Boolean,
      default: false,
    },
    matchedFields: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const governmentRecordSchema = new mongoose.Schema(
  {
    aadhaar: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    pan: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const ListerVerification = mongoose.model(
  "ListerVerification",
  listerVerificationSchema
);
export const VerificationRecord = mongoose.model(
  "VerificationRecord",
  verificationRecordSchema
);
export const GovernmentRecord = mongoose.model(
  "GovernmentRecord",
  governmentRecordSchema
);
