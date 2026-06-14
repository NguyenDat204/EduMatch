const mongoose = require("mongoose");

const SurveyQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["choice", "scale"],
      required: true,
    },
    options: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      enum: ["personality", "interest", "skill"],
      required: true,
    },
    // RIASEC group for Phase 1 questions (Holland Code)
    riasecGroup: {
      type: String,
      enum: ["R", "I", "A", "S", "E", "C", null],
      default: null,
    },
    // Survey phase: 1 = RIASEC activity interests, 2 = Deep motivation & context
    phase: {
      type: Number,
      enum: [1, 2],
      default: 1,
    },
    order: {
      type: Number,
      required: true,
      index: true,
    },
  },
  {
    versionKey: false,
  },
);

module.exports = mongoose.model("SurveyQuestion", SurveyQuestionSchema);
