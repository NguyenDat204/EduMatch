const mongoose = require("mongoose");

const RecommendationFeedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    surveyHistoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SurveyHistory",
    },
    resultFingerprint: {
      type: String,
      required: true,
      index: true,
    },
    archetype: {
      type: String,
      default: "",
    },
    hollandCode: {
      type: String,
      default: "",
    },
    topCareerTitle: {
      type: String,
      default: "",
    },
    perceivedAccuracy: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    topCareerFit: {
      type: String,
      enum: ["interested", "unsure", "not_interested"],
      default: "unsure",
    },
    comment: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    scoreSnapshot: {
      suitabilityScore: { type: Number, default: 0 },
      confidence: { type: Object, default: {} },
      scoreBreakdown: { type: Object, default: {} },
      riasecScores: { type: Object, default: {} },
      method: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

RecommendationFeedbackSchema.index(
  { userId: 1, resultFingerprint: 1 },
  { unique: true }
);

module.exports = mongoose.model("RecommendationFeedback", RecommendationFeedbackSchema);
