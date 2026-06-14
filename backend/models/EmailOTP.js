const mongoose = require("mongoose");

const EmailOTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["verify", "reset"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verifiedAt: {
      type: Date,
    },
    metadata: {
      name: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

EmailOTPSchema.index({ email: 1, type: 1 }, { unique: true });
EmailOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("EmailOTP", EmailOTPSchema);
