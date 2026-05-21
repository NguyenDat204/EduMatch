const Subscription = require("../models/Subscription");
const User = require("../models/User");

// @desc    Get available subscription plans
// @route   GET /api/subscription/plans
// @access  Public
const getPlans = async (req, res) => {
  try {
    const plans = [
      {
        id: "free",
        name: "Free Plan",
        price: 0,
        pricePerMonth: 0,
        billingCycle: "free",
        description: "Perfect for getting started",
        features: [
          "Personality assessment",
          "Interest evaluation",
          "Skill self-assessment",
          "View 5 career recommendations",
          "Limited AI chat (5 messages/day)",
          "Browse universities",
        ],
        limitations: [
          "No career roadmap",
          "No skill gap analysis",
          "No advanced analytics",
          "Limited content access",
        ],
      },
      {
        id: "pro",
        name: "Pro Plan",
        price: 99000, // VND
        pricePerMonth: 99000,
        billingCycle: "monthly",
        description: "Best for serious career exploration",
        features: [
          "All Free features",
          "Unlimited AI chat",
          "AI career roadmap generation",
          "Skill gap analysis",
          "Advanced analytics dashboard",
          "Career comparison tools",
          "PDF reports & exports",
          "Priority email support",
        ],
        limitations: [],
      },
      {
        id: "premium",
        name: "Premium Plan",
        price: 999000, // VND
        pricePerMonth: 999000,
        billingCycle: "yearly",
        description: "Ultimate career guidance package",
        features: [
          "All Pro features",
          "1-on-1 career advisor consultation (monthly)",
          "Resume optimization with AI",
          "Interview preparation coaching",
          "Direct university partnership access",
          "Exclusive job opportunities",
          "Lifetime access to resources",
          "24/7 priority support",
        ],
        limitations: [],
      },
    ];

    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's subscription status
// @route   GET /api/subscription/status
// @access  Private
const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    let subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      // Create free subscription if doesn't exist
      subscription = await Subscription.create({
        userId,
        planType: "free",
        startDate: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Upgrade to pro/premium
// @route   POST /api/subscription/upgrade
// @access  Private
const upgradeSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planType, billingCycle } = req.body;

    if (!planType || !["pro", "premium"].includes(planType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan type",
      });
    }

    // Get or create subscription
    let subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      subscription = await Subscription.create({
        userId,
        planType,
        billingCycle: billingCycle || "monthly",
        paymentStatus: "pending",
        startDate: new Date(),
      });
    } else {
      subscription.planType = planType;
      subscription.billingCycle = billingCycle || "monthly";
      subscription.paymentStatus = "pending";
      await subscription.save();
    }

    // Update user's isPro status
    await User.findByIdAndUpdate(userId, { isPro: true });

    res.status(200).json({
      success: true,
      message: "Subscription updated. Proceed to payment.",
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Cancel subscription
// @route   POST /api/subscription/cancel
// @access  Private
const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reason } = req.body;

    const subscription = await Subscription.findOneAndUpdate(
      { userId },
      {
        planType: "free",
        paymentStatus: "cancelled",
        cancellationDate: new Date(),
        cancellationReason: reason,
      },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Update user's isPro status
    await User.findByIdAndUpdate(userId, { isPro: false });

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get subscription billing history
// @route   GET /api/subscription/history
// @access  Private
const getBillingHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No subscription found",
      });
    }

    res.status(200).json({
      success: true,
      data: subscription.billingHistory || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Handle payment webhook (from payment gateway)
// @route   POST /api/subscription/webhook
// @access  Public (with signature verification)
const handlePaymentWebhook = async (req, res) => {
  try {
    const { transactionId, userId, status, amount } = req.body;

    // TODO: Verify webhook signature from payment gateway

    const subscription = await Subscription.findOneAndUpdate(
      { userId, transactionId },
      {
        paymentStatus: status,
      },
      { new: true }
    );

    if (subscription && status === "completed") {
      // Set renewal date
      const now = new Date();
      let endDate;

      if (subscription.billingCycle === "monthly") {
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      } else if (subscription.billingCycle === "yearly") {
        endDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      }

      subscription.endDate = endDate;
      subscription.renewalDate = endDate;

      // Add to billing history
      subscription.billingHistory.push({
        date: now,
        amount,
        transactionId,
        status: "completed",
      });

      await subscription.save();

      // Update user Pro status
      if (subscription.planType !== "free") {
        await User.findByIdAndUpdate(userId, { isPro: true });
      }
    }

    res.status(200).json({
      success: true,
      message: "Payment processed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getPlans,
  getSubscriptionStatus,
  upgradeSubscription,
  cancelSubscription,
  getBillingHistory,
  handlePaymentWebhook,
};
