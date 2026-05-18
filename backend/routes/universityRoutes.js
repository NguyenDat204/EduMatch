const express = require("express");
const router = express.Router();
const {
  getUniversities,
  getUniversity,
  createUniversity,
  updateUniversity,
  deleteUniversity,
} = require("../controllers/universityController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getUniversities);
router.get("/:id", getUniversity);

// Admin-only routes
router.post("/", protect, admin, createUniversity);
router.put("/:id", protect, admin, updateUniversity);
router.delete("/:id", protect, admin, deleteUniversity);

module.exports = router;
