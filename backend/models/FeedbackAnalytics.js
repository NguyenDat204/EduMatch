const mongoose = require("mongoose");

const FeedbackAnalyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    feedbackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback",
      required: true,
    },
    accuracy_rating: {
      type: Number,
      min: 1,
      max: 5,
      description: "How accurate was the AI recommendation?",
    },
    usefulness_rating: {
      type: Number,
      min: 1,
      max: 5,
      description: "How useful was the career match?",
    },
    relevance_rating: {
      type: Number,
      min: 1,
      max: 5,
      description: "How relevant was the recommendation to user's profile?",
    },
    tags: [
      {
        type: String,
        enum: [
          "too_narrow",
          "too_broad",
          "not_realistic",
          "perfect_fit",
          "needs_more_info",
          "missing_interests",
          "outdated_info",
          "great_explanation",
          "lack_of_detail",
        ],
      },
    ],
    improvementSuggestions: String,
    futureCareerInterest: [String],
    followUpActionTaken: {
      type: Boolean,
      description: "Did user take action based on recommendation?",
    },
    followUpDetails: String,
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: String,
  },
  { timestamps: true }
);

FeedbackAnalyticsSchema.index({ userId: 1, createdAt: -1 });
FeedbackAnalyticsSchema.index({ tags: 1 });

module.exports = mongoose.model("FeedbackAnalytics", FeedbackAnalyticsSchema);
