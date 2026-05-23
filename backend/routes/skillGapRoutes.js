const express = require("express");
const router = express.Router();
const skillGapController = require("../controllers/skillGapController");
const { protect } = require("../middleware/authMiddleware");

// Skill gap analysis endpoints
router.post("/", protect, skillGapController.analyzeSkillGap);
router.get("/", protect, skillGapController.getUserSkillGaps);
router.get("/:careerId", protect, skillGapController.getSkillGapAnalysis);

module.exports = router;
