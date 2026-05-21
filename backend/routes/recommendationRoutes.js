const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");
const { authenticate } = require("../middleware/authMiddleware");

// Legacy endpoint for AI recommendations
router.post("/", recommendationController.getRecommendations);

// New endpoints for recommendation management
router.get("/", authenticate, recommendationController.getUserRecommendations);
router.get("/latest", authenticate, recommendationController.getLatestRecommendation);
router.post("/:id/accept", authenticate, recommendationController.acceptRecommendation);

module.exports = router;
