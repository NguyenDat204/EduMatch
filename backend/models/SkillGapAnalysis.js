const mongoose = require("mongoose");

const SkillGapAnalysisSchema = new mongoose.Schema(
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
      required: true,
    },
    currentSkills: {
      type: Map,
      of: {
        level: { type: Number, min: 0, max: 10 }, // 0-10 proficiency scale
        yearsOfExperience: Number,
        lastUpdated: Date,
      },
      default: new Map(),
    },
    requiredSkills: {
      type: Map,
      of: {
        level: { type: Number, min: 0, max: 10 },
        importance: { type: String, enum: ["critical", "high", "medium", "nice_to_have"] },
      },
      default: new Map(),
    },
    skillGaps: [
      {
        skillName: {
          type: String,
          required: true,
        },
        currentLevel: { type: Number, min: 0, max: 10 },
        requiredLevel: { type: Number, min: 0, max: 10 },
        gap: { type: Number, min: 0, max: 10 }, // Required - Current
        priority: { type: String, enum: ["urgent", "high", "medium", "low"], default: "medium" },
        improvementStrategy: String,
        recommendedResources: [
          {
            title: String,
            type: { type: String, enum: ["course", "book", "practice", "project"] },
            url: String,
            estimatedHours: Number,
          },
        ],
      },
    ],
    overallGapScore: {
      type: Number,
      min: 0,
      max: 100,
      description: "Percentage indicating overall skill readiness (0=not ready, 100=fully ready)",
    },
    timeToReadiness: {
      type: String,
      description: "Estimated time to acquire missing skills (e.g., '3-6 months')",
    },
    analysisDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

SkillGapAnalysisSchema.index({ userId: 1, analysisDate: -1 });
SkillGapAnalysisSchema.index({ userId: 1, careerId: 1 });

module.exports = mongoose.model("SkillGapAnalysis", SkillGapAnalysisSchema);
