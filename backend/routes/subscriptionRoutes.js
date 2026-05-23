const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.get("/plans", subscriptionController.getPlans);
router.post("/webhook", subscriptionController.handlePaymentWebhook);

// Protected routes
router.get("/status", protect, subscriptionController.getSubscriptionStatus);
router.post("/upgrade", protect, subscriptionController.upgradeSubscription);
router.post("/cancel", protect, subscriptionController.cancelSubscription);
router.get("/history", protect, subscriptionController.getBillingHistory);

module.exports = router;
