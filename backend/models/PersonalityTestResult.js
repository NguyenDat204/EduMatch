const mongoose = require("mongoose");

const PersonalityTestResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    testType: {
      type: String,
      enum: ["MBTI", "HollandCode", "Big5", "RIASEC"],
      required: true,
    },
    result: {
      type: {
        mbti: { type: String }, // e.g., "INTJ"
        hollandCode: { type: String }, // e.g., "IRA"
        big5: {
          openness: Number,
          conscientiousness: Number,
          extraversion: Number,
          agreeableness: Number,
          neuroticism: Number,
        },
      },
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      description: "Confidence score of the personality assessment",
    },
    insights: [
      {
        title: String,
        description: String,
      },
    ],
    matchedCareers: [
      {
        careerId: mongoose.Schema.Types.ObjectId,
        careerTitle: String,
        compatibility: { type: Number, min: 0, max: 100 },
      },
    ],
    answers: {
      type: Map,
      of: String,
      description: "User's answers to test questions (question_id -> answer)",
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      description: "When this test result should be retaken (e.g., after 1 year)",
    },
    notes: String,
  },
  { timestamps: true }
);

PersonalityTestResultSchema.index({ userId: 1, completedAt: -1 });
PersonalityTestResultSchema.index({ userId: 1, testType: 1 });

module.exports = mongoose.model("PersonalityTestResult", PersonalityTestResultSchema);
