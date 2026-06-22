const mongoose = require("mongoose");

const SurveyHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "",
    },
    answers: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    result: {
      archetype:        { type: String,  default: "" },
      hollandCode:      { type: String,  default: "" },
      description:      { type: String,  default: "" },
      suitabilityScore: { type: Number,  default: 0  },
      insights:         { type: String,  default: "" },
      riasecScores:     { type: Map, of: Number, default: {} },
      scoreBreakdown:   { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
      confidence:       { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
      method:           { type: String, default: "" },
      surveyThreshold:  { type: Number, default: 70 },
      careers:          { type: Array,   default: [] },
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

SurveyHistorySchema.index({ userId: 1, completedAt: -1 });

module.exports = mongoose.model("SurveyHistory", SurveyHistorySchema);
