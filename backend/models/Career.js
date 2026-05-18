const mongoose = require("mongoose");

const CareerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    salary: {
      type: String,
      default: "$80k - $120k",
    },
    growth: {
      type: String,
      default: "Steady (+10%)",
    },
    skills: {
      type: [String],
      default: [],
    },
    suitability: {
      type: Number,
      default: 80,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    roadmap: [
      {
        phase: { type: String, required: true },
        title: { type: String, required: true },
        duration: { type: String, required: true },
        description: { type: String, required: true },
        skillsToAcquire: [String]
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Career", CareerSchema);
