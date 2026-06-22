const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "admin", "university"],
      default: "student",
    },
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
    },
    avatar: {
      type: String,
      default: "https://i.pravatar.cc/150?u=student",
    },
    isPro: {
      type: Boolean,
      default: false,
    },
    subscription: {
      plan: { type: String, default: "free", enum: ["free", "pro"] },
      startDate: { type: Date },
      endDate: { type: Date },
      status: { type: String, default: "none" }
    },
    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
    },
    plan_started_at: {
      type: Date,
    },
    plan_expired_at: {
      type: Date,
    },
    resetPasswordOTP: { type: String },
    resetPasswordOTPExpires: { type: Date },
    academicInfo: {
      school: { type: String, default: "" },
      grade: { type: String, default: "12" },
      majorInterest: { type: String, default: "" },
      subjects: {
        math: { type: Number, default: 8.0 },
        physics: { type: Number, default: 8.0 },
        chemistry: { type: Number, default: 8.0 },
        english: { type: Number, default: 8.0 },
        literature: { type: Number, default: 8.0 },
        biology: { type: Number, default: 8.0 },
        history: { type: Number, default: 8.0 },
        geography: { type: Number, default: 8.0 }
      }
    },
    personalityTest: {
      archetype: { type: String, default: "" },
      hollandCode: { type: String, default: "" },
      description: { type: String, default: "" },
      suitabilityScore: { type: Number, default: 0 },
      insights: { type: String, default: "" },
      riasecScores: { type: Map, of: Number, default: {} },
      scoreBreakdown: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
      confidence: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
      method: { type: String, default: "" },
      surveyThreshold: { type: Number, default: 70 },
      careers: { type: Array, default: [] },
      answers: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
      updatedAt: { type: Date }
    },
    skillEvaluation: {
      scores: {
        technical: { type: Number, default: 50 },
        creative: { type: Number, default: 50 },
        communication: { type: Number, default: 50 },
        analytical: { type: Number, default: 50 },
        leadership: { type: Number, default: 50 },
      },
      updatedAt: { type: Date }
    },
    favorites: [
      {
        type: String, // Store career ID or titles
      }
    ]
  },
  { timestamps: true }
);

// Encrypt password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
