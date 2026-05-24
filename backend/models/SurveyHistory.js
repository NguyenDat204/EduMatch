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
      description:      { type: String,  default: "" },
      suitabilityScore: { type: Number,  default: 0  },
      insights:         { type: String,  default: "" },
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
