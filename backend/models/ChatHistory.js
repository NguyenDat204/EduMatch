const mongoose = require("mongoose");

const ChatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      description: "Unique identifier for this conversation session",
    },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        tokens: {
          input: Number,
          output: Number,
        },
      },
    ],
    context: {
      careerId: mongoose.Schema.Types.ObjectId,
      universityId: mongoose.Schema.Types.ObjectId,
      topicFocus: String, // e.g., "career_exploration", "skill_development", "university_search"
    },
    modelVersion: {
      type: String,
      default: "gemini-pro",
      description: "AI model version used for this conversation",
    },
    totalTokens: {
      input: { type: Number, default: 0 },
      output: { type: Number, default: 0 },
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      description: "Auto-generated or user-set title for conversation",
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

ChatHistorySchema.index({ userId: 1, lastMessageTime: -1 });
ChatHistorySchema.index({ userId: 1, isArchived: 1 });

module.exports = mongoose.model("ChatHistory", ChatHistorySchema);
