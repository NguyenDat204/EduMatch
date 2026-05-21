const mongoose = require("mongoose");

const InterestAssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    interests: [
      {
        category: {
          type: String,
          enum: [
            "technology",
            "business",
            "arts_design",
            "science",
            "healthcare",
            "education",
            "finance",
            "engineering",
            "humanities",
            "law",
            "agriculture",
            "sports",
            "media",
            "hospitality",
            "environment",
          ],
          required: true,
        },
        level: {
          type: Number,
          min: 0,
          max: 10,
          required: true,
          description: "Interest level (0-10)",
        },
        reason: String,
      },
    ],
    activities: [
      {
        activity: String,
        interestLevel: { type: Number, min: 0, max: 10 },
      },
    ],
    responses: {
      type: Map,
      of: String,
      description: "Responses to assessment questions",
    },
    topInterests: [
      {
        category: String,
        score: Number,
      },
    ],
    careerMatches: [
      {
        careerId: mongoose.Schema.Types.ObjectId,
        careerTitle: String,
        matchPercentage: { type: Number, min: 0, max: 100 },
      },
    ],
    analyzedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: String,
  },
  { timestamps: true }
);

InterestAssessmentSchema.index({ userId: 1, analyzedAt: -1 });

module.exports = mongoose.model("InterestAssessment", InterestAssessmentSchema);
