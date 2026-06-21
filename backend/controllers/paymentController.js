const { getPayOSInstance } = require("../config/payos");
const Payment = require("../models/Payment");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const paymentService = require("../services/paymentService");

/**
 * @payos/node v2 API Reference (verified from SDK source code):
 * - payos.paymentRequests.create(data)          → CreatePaymentLinkResponse
 * - payos.paymentRequests.get(orderCode|linkId)  → PaymentLink { status, ... }
 * - payos.paymentRequests.cancel(orderCode|linkId, reason?) → PaymentLink
 * - payos.webhooks.confirm(webhookUrl)           → ConfirmWebhookResponse
 * - payos.webhooks.verify(body)                  → Promise<WebhookData>
 *
 * PaymentLink.status values: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED' | 'PROCESSING' | 'FAILED' | 'UNDERPAID'
 */

/**
 * Generates a unique numeric order code compatible with PayOS.
 * PayOS requires orderCode to be a safe integer (max 9007199254740991).
 */
const generateUniqueOrderCode = async () => {
  let isUnique = false;
  let orderCode;

  while (!isUnique) {
    const timestampStr = Date.now().toString().slice(-9);
    const randomStr = Math.floor(100 + Math.random() * 900).toString();
    orderCode = parseInt(timestampStr + randomStr, 10);

    const existing = await Payment.findOne({ order_code: orderCode });
    if (!existing) {
      isUnique = true;
    }
  }
  return orderCode;
};

// @desc    Create PayOS payment link and QR
// @route   POST /api/payments/create
// @access  Private
const createPayment = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp mã gói dịch vụ (planId).",
      });
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.is_active) {
      return res.status(404).json({
        success: false,
        message: "Gói dịch vụ không tồn tại hoặc đã ngừng hoạt động.",
      });
    }

    const amount = plan.price;
    const orderCode = await generateUniqueOrderCode();
    const description = `Edumatch ${plan.slug || "pro"} ${orderCode}`;

    const paymentData = {
      orderCode,
      amount,
      description: description.slice(0, 25),
      cancelUrl: process.env.PAYOS_CANCEL_URL || "http://localhost:5173/payment/cancel",
      returnUrl: process.env.PAYOS_RETURN_URL || "http://localhost:5173/payment/success",
      expiredAt: Math.floor(Date.now() / 1000) + 15 * 60,
    };

    const payos = await getPayOSInstance();

    let paymentLink;
    try {
      // @payos/node v2: paymentRequests.create()
      paymentLink = await payos.paymentRequests.create(paymentData);
    } catch (payosErr) {
      console.error("[PayOS] createPaymentLink Error:", payosErr.message);
      return res.status(500).json({
        success: false,
        message: "Không thể tạo liên kết thanh toán từ cổng PayOS. Vui lòng thử lại sau.",
      });
    }

    const payment = await Payment.create({
      user_id: req.user.id,
      plan_id: plan._id,
      order_code: orderCode,
      amount,
      description,
      status: "PENDING",
      payment_link_id: paymentLink.paymentLinkId,
      checkout_url: paymentLink.checkoutUrl,
      qr_code: paymentLink.qrCode,
    });

    return res.status(201).json({
      orderCode: payment.order_code,
      amount: payment.amount,
      status: payment.status,
      checkoutUrl: payment.checkout_url,
      qrCode: payment.qr_code,
      expiredAt: new Date(paymentData.expiredAt * 1000).toISOString(),
    });
  } catch (error) {
    console.error("[createPayment] Unexpected error:", error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra trong quá trình khởi tạo thanh toán.",
    });
  }
};

// @desc    Check payment status and sync with PayOS
// @route   GET /api/payments/:orderCode
// @access  Private
const checkPaymentStatus = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const code = Number(orderCode);

    if (isNaN(code)) {
      return res.status(400).json({ success: false, message: "Mã đơn hàng không hợp lệ." });
    }

    let payment = await Payment.findOne({ order_code: code });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Giao dịch không tồn tại." });
    }

    if (payment.user_id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập thông tin giao dịch này.",
      });
    }

    // ── Fast path: terminal states → trả về ngay từ DB, không gọi PayOS ──
    if (payment.status !== "PENDING") {
      return res.status(200).json({ status: payment.status });
    }

    // ── Anti-spam: chỉ gọi PayOS tối đa mỗi 0.5 giây ──
    const now = new Date();
    if (payment.last_verified_at && now - new Date(payment.last_verified_at) < 850) {
      return res.status(200).json({ status: payment.status });
    }

    // Cập nhật last_verified_at trước khi gọi PayOS để tránh race condition
    payment.last_verified_at = now;
    await payment.save();

    // ── Gọi PayOS API đúng method: paymentRequests.get(orderCode) ──
    const payos = await getPayOSInstance();
    let paymentInfo;
    try {
      // @payos/node v2: paymentRequests.get(orderCode: number) → PaymentLink
      paymentInfo = await payos.paymentRequests.get(code);
      console.log(`[PayOS Status Sync] Queried PayOS for order ${code} at ${new Date().toISOString()}`);
      console.log(`- PayOS Status: ${paymentInfo.status}`);
      console.log(`- Raw SDK Response:`, JSON.stringify(paymentInfo, null, 2));
    } catch (payosErr) {
      console.warn(`[PayOS Status Sync] Could not fetch PayOS status for order ${code} at ${new Date().toISOString()}:`, payosErr.message);
      // Trả về trạng thái hiện tại trong DB nếu PayOS không phản hồi
      return res.status(200).json({ status: payment.status });
    }

    // ── Xử lý kết quả từ PayOS và đồng bộ DB ──
    if (paymentInfo.status === "PAID") {
      console.log(`[PayOS Status Sync] Order ${code} verified as PAID. Calling markAsPaid...`);
      payment = await paymentService.markAsPaid(code);
    } else if (paymentInfo.status === "CANCELLED") {
      payment.status = "CANCELLED";
      await payment.save();
      console.log(`[PayOS Status Sync] Order ${code} verified as CANCELLED. Updated status in database.`);
    } else if (paymentInfo.status === "EXPIRED" || paymentInfo.status === "FAILED") {
      payment.status = "FAILED";
      await payment.save();
      console.log(`[PayOS Status Sync] Order ${code} verified as FAILED/EXPIRED. Updated status in database.`);
    }
    // Các trạng thái PROCESSING, UNDERPAID → giữ nguyên PENDING để polling tiếp

    return res.status(200).json({ status: payment.status });
  } catch (error) {
    console.error("[checkPaymentStatus] Unexpected error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi kiểm tra trạng thái thanh toán.",
    });
  }
};

// @desc    Handle PayOS Webhook
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = async (req, res) => {
  try {
    const payos = await getPayOSInstance();

    let webhookData;
    try {
      // @payos/node v2: webhooks.verify() là async, trả về Promise<WebhookData>
      webhookData = await payos.webhooks.verify(req.body);
    } catch (verifyErr) {
      console.error("[Webhook] Signature verification failed:", verifyErr.message);
      return res.status(400).json({
        success: false,
        message: "Chữ ký webhook không hợp lệ.",
      });
    }

    // webhookData là WebhookData trực tiếp (không cần .data)
    const { orderCode, description } = webhookData;
    console.log(`[Webhook] Verified at ${new Date().toISOString()} - OrderCode: ${orderCode}, Description: ${description}`);
    console.log(`- Raw Webhook Data:`, JSON.stringify(webhookData, null, 2));

    await paymentService.markAsPaid(orderCode);

    return res.status(200).json({
      success: true,
      message: "Webhook xử lý thành công",
    });
  } catch (error) {
    console.error("[handleWebhook] Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi xử lý webhook nội bộ.",
    });
  }
};

module.exports = {
  createPayment,
  checkPaymentStatus,
  handleWebhook,
};
