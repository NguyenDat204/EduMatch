const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");
const { protect } = require("../middleware/authMiddleware");

// Legacy endpoint for AI recommendations
router.post("/", recommendationController.getRecommendations);

// New endpoints for recommendation management
router.get("/", protect, recommendationController.getUserRecommendations);
router.get("/latest", protect, recommendationController.getLatestRecommendation);
router.post("/:id/accept", protect, recommendationController.acceptRecommendation);

module.exports = router;
