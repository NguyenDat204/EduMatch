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

// Optional auth middleware — attaches user if token present, proceeds anyway
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken');
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { _id: decoded.id, id: decoded.id };
    } catch {
      // Invalid token → proceed as anonymous
    }
  }
  next();
};

// Public routes
router.get("/", getUniversities);

// University representative self-management routes (MUST be before /:id)
router.get("/managed/my-university", protect, getMyUniversity);
router.put("/managed/my-university", protect, updateMyUniversity);

router.get("/:id", getUniversity);

// Track instant view (no auth required but logs user if logged in)
router.post("/:id/view", optionalAuth, incrementViews);

// Admin-only routes
router.post("/", protect, admin, createUniversity);
router.put("/:id", protect, admin, updateUniversity);
router.delete("/:id", protect, admin, deleteUniversity);

module.exports = router;
