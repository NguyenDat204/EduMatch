const mongoose = require("mongoose");

const CareerRecommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recommendedCareers: [
      {
        careerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Career",
        },
        matchScore: {
          type: Number,
          min: 0,
          max: 100,
          required: true,
        },
        explanation: {
          type: String,
          description: "AI-generated reason for this recommendation",
        },
        rank: Number,
      },
    ],
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    isAccepted: {
      type: Boolean,
      default: null,
      description: "User validation: null=not yet rated, true=helpful, false=not helpful",
    },
    userFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
    },
  },
  { timestamps: true }
);

// Index for finding latest recommendations per user
CareerRecommendationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("CareerRecommendation", CareerRecommendationSchema);
