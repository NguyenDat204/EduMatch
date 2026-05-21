const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const { authenticate } = require("../middleware/authMiddleware");

// Public routes
router.get("/plans", subscriptionController.getPlans);
router.post("/webhook", subscriptionController.handlePaymentWebhook);

// Protected routes
router.get("/status", authenticate, subscriptionController.getSubscriptionStatus);
router.post("/upgrade", authenticate, subscriptionController.upgradeSubscription);
router.post("/cancel", authenticate, subscriptionController.cancelSubscription);
router.get("/history", authenticate, subscriptionController.getBillingHistory);

module.exports = router;
