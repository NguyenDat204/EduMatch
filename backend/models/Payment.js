const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      index: true,
    },
    order_code: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    payment_link_id: {
      type: String,
    },
    checkout_url: {
      type: String,
    },
    qr_code: {
      type: String,
    },
    paid_at: {
      type: Date,
    },
    last_verified_at: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Virtual for id to match the default behavior
PaymentSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

PaymentSchema.set("toJSON", { virtuals: true });
PaymentSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Payment", PaymentSchema);
