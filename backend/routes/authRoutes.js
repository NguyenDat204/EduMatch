const express = require("express");
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

router.post("/send-verify-otp", sendVerifyOTP);
router.post("/verify-email-otp", verifyEmailOTP);
router.post("/register", registerUser);
router.post("/login", authUser);
router.post("/google", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/change-password", protect, changePassword);

module.exports = router;
