const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updateAcademicProfile,
  updateSkillEvaluation,
  upgradeToPro,
} = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.put("/academic", protect, updateAcademicProfile);
router.put("/skills", protect, updateSkillEvaluation);
router.post("/upgrade", protect, upgradeToPro);

module.exports = router;
