const mongoose = require("mongoose");

const CareerRoadmapSchema = new mongoose.Schema(
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
    phases: [
      {
        phaseId: mongoose.Schema.Types.ObjectId,
        title: String,
        duration: String,
        description: String,
        skillsToAcquire: [String],
        isCompleted: {
          type: Boolean,
          default: false,
        },
        completedAt: Date,
        resources: [
          {
            title: String,
            url: String,
            type: { type: String, enum: ["course", "book", "project", "certification"] },
          },
        ],
        notes: String,
      },
    ],
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetEndDate: Date,
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "paused", "completed"],
      default: "not_started",
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

CareerRoadmapSchema.index({ userId: 1, careerId: 1 });
CareerRoadmapSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("CareerRoadmap", CareerRoadmapSchema);
