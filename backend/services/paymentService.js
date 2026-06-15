const Payment = require("../models/Payment");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const SubscriptionPlan = require("../models/SubscriptionPlan");

/**
 * Marks a payment as PAID, updates the user's account status to Pro,
 * and sets up/renews the Subscription document.
 * 
 * This service is fully idempotent and protects against duplicate processing
 * or race conditions between webhook calls and client polling.
 * 
 * @param {number|string} orderCode The order code associated with the payment
 * @returns {Promise<object>} The updated payment document
 */
const markAsPaid = async (orderCode) => {
  const code = Number(orderCode);
  if (isNaN(code)) {
    throw new Error(`Invalid orderCode type: ${orderCode}`);
  }

  // 1. Atomically update the payment status to PAID only if it is NOT already PAID.
  // This prevents multiple webhooks/polling requests from trigger upgrading twice.
  const payment = await Payment.findOneAndUpdate(
    { order_code: code, status: { $ne: "PAID" } },
    {
      $set: {
        status: "PAID",
        paid_at: new Date(),
      },
    },
    { new: true }
  );

  // If payment is null, it was either:
  // - Already marked as PAID (idempotent path)
  // - Or the payment doesn't exist at all.
  if (!payment) {
    const existingPayment = await Payment.findOne({ order_code: code });
    if (existingPayment && existingPayment.status === "PAID") {
      console.log(`Payment with orderCode ${code} is already PAID. Skipping duplicate processing.`);
      return existingPayment;
    }
    throw new Error(`Payment record not found for orderCode: ${code}`);
  }

  console.log(`[PaymentService] Marking payment ${code} as PAID. Commencing Pro subscription activation for user: ${payment.user_id}`);

  const userId = payment.user_id;
  const planId = payment.plan_id;
  const now = new Date();

  // Fetch plan details dynamically
  let plan = null;
  if (planId) {
    plan = await SubscriptionPlan.findById(planId);
  } else {
    // Fallback to default pro plan if plan_id is missing on payment
    plan = await SubscriptionPlan.findOne({ slug: "pro" });
  }

  let durationDays = 30;
  let planSlug = "pro";

  if (plan) {
    durationDays = plan.duration_days;
    planSlug = plan.slug;
  }

  const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  // 2. Upgrade the User document properties
  await User.findByIdAndUpdate(userId, {
    $set: {
      isPro: true,
      plan_id: plan ? plan._id : null,
      plan_started_at: now,
      plan_expired_at: endDate,
      subscription: {
        plan: planSlug,
        startDate: now,
        endDate: endDate,
        status: "active",
      },
    },
  });

  // 3. Find, create, or update the Subscription collection document
  let subscription = await Subscription.findOne({ userId });
  const billingCycle = durationDays >= 360 ? "yearly" : (durationDays >= 90 ? "quarterly" : "monthly");
  
  if (!subscription) {
    subscription = await Subscription.create({
      userId,
      planType: planSlug,
      billingCycle: billingCycle,
      paymentStatus: "completed",
      startDate: now,
      endDate: endDate,
      transactionId: String(code),
      paymentMethod: "bank_transfer",
      features: {
        unlimitedChat: true,
        advancedAnalytics: true,
        careerRoadmap: true,
        skillGapAnalysis: true,
        prioritySupport: true,
        exportReports: true,
      },
      billingHistory: [
        {
          date: now,
          amount: payment.amount,
          transactionId: String(code),
          status: "completed",
        },
      ],
    });
  } else {
    // Prevent duplicate entries in billingHistory
    const isHistoryRecorded = subscription.billingHistory.some(
      (history) => history.transactionId === String(code)
    );

    subscription.planType = planSlug;
    subscription.paymentStatus = "completed";
    subscription.startDate = now;
    subscription.endDate = endDate;
    subscription.transactionId = String(code);
    subscription.billingCycle = billingCycle;

    if (!isHistoryRecorded) {
      subscription.billingHistory.push({
        date: now,
        amount: payment.amount,
        transactionId: String(code),
        status: "completed",
      });
    }

    await subscription.save();
  }

  console.log(`[PaymentService] Subscription for user ${userId} successfully activated. Validity: ${durationDays} days.`);
  return payment;
};

module.exports = {
  markAsPaid,
};
