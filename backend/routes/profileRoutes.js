const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updateAcademicProfile,
  updateSkillEvaluation,
} = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.put("/academic", protect, updateAcademicProfile);
router.put("/skills", protect, updateSkillEvaluation);

module.exports = router;
