const express = require("express");
const router = express.Router();
const { submitFeedback, getFeedback, deleteFeedback } = require("../controllers/feedbackController");
const { protect, admin } = require("../middleware/authMiddleware");

// Route is optional protect (any user can submit feedback, but if logged in, we attach their account)
const { protect: optionalProtect } = require("../middleware/authMiddleware");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const checkAuthOptional = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "edumatchsecret123");
      req.user = await User.findById(decoded.id).select("-password");
    } catch (err) {
      console.warn("Optional auth check failed:", err.message);
    }
  }
  next();
};

router.post("/", checkAuthOptional, submitFeedback);
router.get("/", protect, admin, getFeedback);
router.delete("/:id", protect, admin, deleteFeedback);

module.exports = router;
