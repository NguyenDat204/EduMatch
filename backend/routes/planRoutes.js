const express = require("express");
const router = express.Router();
const {
  getActivePlans,
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getDashboardMetrics,
} = require("../controllers/planController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.get("/plans", getActivePlans);

// Admin routes
router.get("/admin/plans/dashboard", protect, admin, getDashboardMetrics);
router.get("/admin/plans", protect, admin, getAllPlans);
router.get("/admin/plans/:id", protect, admin, getPlanById);
router.post("/admin/plans", protect, admin, createPlan);
router.put("/admin/plans/:id", protect, admin, updatePlan);
router.delete("/admin/plans/:id", protect, admin, deletePlan);

module.exports = router;
