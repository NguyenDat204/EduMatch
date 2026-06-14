const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const {
  registerUser,
  authUser,
  googleLogin,
  forgotPassword,
  resetPassword,
  changePassword,
  sendVerifyOTP,
  verifyEmailOTP,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Strict limiter for login/register (prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 1 phút.' },
});

// Separate, more generous limiter for OTP endpoints
// (users may attempt a few times if email is slow, don't block them)
const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Quá nhiều yêu cầu OTP, vui lòng thử lại sau 1 phút.' },
});

router.post("/send-verify-otp", otpLimiter, sendVerifyOTP);
router.post("/verify-email-otp", otpLimiter, verifyEmailOTP);
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/reset-password", otpLimiter, resetPassword);
router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, authUser);
router.post("/google", authLimiter, googleLogin);
router.put("/change-password", protect, changePassword);

module.exports = router;
