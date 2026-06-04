const express = require("express");
const router = express.Router();
const {
  getUsers,
  updateUser,
  deleteUser,
  getSystemAnalytics,
  getAllSurveyHistories,
  getSystemSettings,
  updateSystemSettings,
  getUserActivity,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/users", protect, admin, getUsers);
router.put("/users/:id", protect, admin, updateUser);
router.delete("/users/:id", protect, admin, deleteUser);
router.get("/users/:id/activity", protect, admin, getUserActivity);
router.get("/analytics", protect, admin, getSystemAnalytics);
router.get("/surveys", protect, admin, getAllSurveyHistories);
router.get("/settings", protect, admin, getSystemSettings);
router.put("/settings", protect, admin, updateSystemSettings);

module.exports = router;
