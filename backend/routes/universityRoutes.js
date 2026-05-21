const express = require("express");
const router = express.Router();
const {
  getUniversities,
  getUniversity,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  incrementViews,
  getMyUniversity,
  updateMyUniversity,
} = require("../controllers/universityController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getUniversities);

// University representative self-management routes (MUST be before /:id)
router.get("/managed/my-university", protect, getMyUniversity);
router.put("/managed/my-university", protect, updateMyUniversity);

router.get("/:id", getUniversity);

// Track 15-second details view
router.post("/:id/view", protect, incrementViews);

// Admin-only routes
router.post("/", protect, admin, createUniversity);
router.put("/:id", protect, admin, updateUniversity);
router.delete("/:id", protect, admin, deleteUniversity);

module.exports = router;
