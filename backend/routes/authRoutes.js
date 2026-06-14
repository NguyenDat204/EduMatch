const express = require("express");
const router = express.Router();
const {
  registerUser,
  authUser,
  googleLogin,
  googleOAuthRedirect,
  googleOAuthCallback,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", authUser);
router.post("/google", googleLogin);
router.get("/google/oauth", googleOAuthRedirect);
router.get("/google/callback", googleOAuthCallback);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/change-password", protect, changePassword);

module.exports = router;
