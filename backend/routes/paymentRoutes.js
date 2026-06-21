const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const paymentController = require("../controllers/paymentController");

// Webhook route - public (signature verified internally in controller)
router.post("/webhook", paymentController.handleWebhook);

// Protected user routes
router.post("/create", protect, paymentController.createPayment);
router.get("/:orderCode", protect, paymentController.checkPaymentStatus);

module.exports = router;
