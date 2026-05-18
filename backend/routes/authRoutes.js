const express = require("express");
const router = express.Router();
const {
  registerUser,
  authUser,
  googleLogin,
  forgotPassword,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", authUser);
router.post("/google", googleLogin);
router.post("/forgot-password", forgotPassword);

module.exports = router;
