const express = require("express");
const router = express.Router();
const {
  getCareers,
  getCareer,
  createCareer,
  updateCareer,
  deleteCareer,
  toggleFavorite,
  getFavorites,
} = require("../controllers/careerController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getCareers);
router.get("/favorites/list", protect, getFavorites);
router.get("/:id", getCareer);

// Protected routes
router.post("/:id/favorite", protect, toggleFavorite);

// Admin-only routes
router.post("/", protect, admin, createCareer);
router.put("/:id", protect, admin, updateCareer);
router.delete("/:id", protect, admin, deleteCareer);

module.exports = router;
