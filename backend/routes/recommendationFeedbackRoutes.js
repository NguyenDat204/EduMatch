const express = require("express");
const router = express.Router();
const {
  submitRecommendationFeedback,
  getRecommendationFeedbackAnalytics,
} = require("../controllers/recommendationFeedbackController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/", protect, submitRecommendationFeedback);
router.get("/analytics", protect, admin, getRecommendationFeedbackAnalytics);

module.exports = router;
