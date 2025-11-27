import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    userMessage: {
      type: String,
      required: true,
      trim: true,
    },
    botReply: {
      type: String,
      required: true,
    },
    metadata: {
      ip: {
        type: String,
      },
      userAgent: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

chatMessageSchema.index({ createdAt: -1 });

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
