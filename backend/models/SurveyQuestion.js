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
