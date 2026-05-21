const mongoose = require("mongoose");

const UserInteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    careerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Career",
    },
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
    },
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
    },
    action: {
      type: String,
      enum: [
        "view",
        "save_favorite",
        "remove_favorite",
        "compare",
        "chat_about",
        "share",
        "inquire",
        "bookmark_article",
      ],
      required: true,
      index: true,
    },
    duration: {
      type: Number,
      description: "Time spent in seconds",
    },
    metadata: {
      referrer: String,
      device: { type: String, enum: ["mobile", "tablet", "desktop"] },
      source: String, // where the user came from
      comparison_ids: [mongoose.Schema.Types.ObjectId], // for comparison actions
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false } // Don't need updated_at here
);

// Compound indexes for analytics queries
UserInteractionSchema.index({ userId: 1, timestamp: -1 });
UserInteractionSchema.index({ action: 1, timestamp: -1 });
UserInteractionSchema.index({ careerId: 1, action: 1 });
UserInteractionSchema.index({ universityId: 1, action: 1 });

module.exports = mongoose.model("UserInteraction", UserInteractionSchema);
