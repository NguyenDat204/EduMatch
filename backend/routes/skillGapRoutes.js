const express = require("express");
const router = express.Router();
const skillGapController = require("../controllers/skillGapController");
const { authenticate } = require("../middleware/authMiddleware");

// Skill gap analysis endpoints
router.post("/", authenticate, skillGapController.analyzeSkillGap);
router.get("/", authenticate, skillGapController.getUserSkillGaps);
router.get("/:careerId", authenticate, skillGapController.getSkillGapAnalysis);

module.exports = router;
