const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    planType: {
      type: String,
      default: "free",
      required: true,
    },
    pricePerMonth: {
      type: Number,
      description: "Price in VND or primary currency",
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "quarterly", "yearly"],
      default: "monthly",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled", "refunded"],
      default: "pending",
      index: true,
    },
    transactionId: {
      type: String,
      description: "Payment gateway transaction ID",
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "bank_transfer", "e_wallet", "paypal"],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      description: "When current subscription period ends",
    },
    renewalDate: {
      type: Date,
      description: "When subscription will renew if autoRenew is enabled",
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    cancellationDate: Date,
    cancellationReason: String,
    features: {
      unlimitedChat: { type: Boolean, default: false },
      advancedAnalytics: { type: Boolean, default: false },
      careerRoadmap: { type: Boolean, default: false },
      skillGapAnalysis: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      exportReports: { type: Boolean, default: false },
    },
    billingHistory: [
      {
        date: Date,
        amount: Number,
        transactionId: String,
        status: String,
      },
    ],
  },
  { timestamps: true }
);

SubscriptionSchema.index({ userId: 1, paymentStatus: 1 });
SubscriptionSchema.index({ planType: 1 });
SubscriptionSchema.index({ endDate: 1 });

module.exports = mongoose.model("Subscription", SubscriptionSchema);
