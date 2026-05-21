const mongoose = require("mongoose");

const UniversityInteractionLogSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    actionType: {
      type: String,
      enum: ["view", "favorite", "compare", "inquiry", "share", "contact"],
      required: true,
      index: true,
    },
    metadata: {
      referrer: String,
      device: { type: String, enum: ["mobile", "tablet", "desktop"] },
      sessionId: String,
      userSchool: String,
      userCity: String,
    },
    inquiryDetails: {
      type: {
        name: String,
        email: String,
        phone: String,
        message: String,
        interestedPrograms: [String],
      },
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
);

// Indexes for analytics
UniversityInteractionLogSchema.index({ universityId: 1, timestamp: -1 });
UniversityInteractionLogSchema.index({ universityId: 1, actionType: 1 });
UniversityInteractionLogSchema.index({ actionType: 1, timestamp: -1 });

module.exports = mongoose.model("UniversityInteractionLog", UniversityInteractionLogSchema);
