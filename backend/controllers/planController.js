const SubscriptionPlan = require("../models/SubscriptionPlan");
const Payment = require("../models/Payment");
const User = require("../models/User");
const mongoose = require("mongoose");

// @desc    Get active plans
// @route   GET /api/plans
// @access  Public
const getActivePlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ is_active: true });
    return res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error("Get Active Plans Error:", error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi lấy danh sách gói dịch vụ.",
    });
  }
};

// @desc    Get all plans (Admin)
// @route   GET /api/admin/plans
// @access  Private/Admin
const getAllPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().sort({ created_at: -1 });
    return res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error("Get All Plans Error:", error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi lấy danh sách gói dịch vụ.",
    });
  }
};

// @desc    Get plan by ID (Admin)
// @route   GET /api/admin/plans/:id
// @access  Private/Admin
const getPlanById = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy gói dịch vụ.",
      });
    }
    return res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error("Get Plan By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi lấy chi tiết gói dịch vụ.",
    });
  }
};

// @desc    Create plan (Admin)
// @route   POST /api/admin/plans
// @access  Private/Admin
const createPlan = async (req, res) => {
  try {
    const { name, slug, description, price, duration_days, is_active } = req.body;

    if (!name || !slug || price === undefined || duration_days === undefined) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin: Tên, Mã gói, Giá và Thời hạn.",
      });
    }

    const existingPlan = await SubscriptionPlan.findOne({ slug: slug.toLowerCase() });
    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: "Mã gói (slug) này đã tồn tại.",
      });
    }

    const plan = await SubscriptionPlan.create({
      name,
      slug: slug.toLowerCase(),
      description: description || "",
      price: Number(price),
      duration_days: Number(duration_days),
      is_active: is_active !== undefined ? is_active : true,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo gói dịch vụ thành công.",
      data: plan,
    });
  } catch (error) {
    console.error("Create Plan Error:", error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi tạo gói dịch vụ.",
    });
  }
};

// @desc    Update plan (Admin)
// @route   PUT /api/admin/plans/:id
// @access  Private/Admin
const updatePlan = async (req, res) => {
  try {
    const { name, slug, description, price, duration_days, is_active } = req.body;

    let plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy gói dịch vụ.",
      });
    }

    if (slug && slug.toLowerCase() !== plan.slug) {
      const existingPlan = await SubscriptionPlan.findOne({ slug: slug.toLowerCase() });
      if (existingPlan) {
        return res.status(400).json({
          success: false,
          message: "Mã gói (slug) này đã tồn tại.",
        });
      }
      plan.slug = slug.toLowerCase();
    }

    if (name !== undefined) plan.name = name;
    if (description !== undefined) plan.description = description;
    if (price !== undefined) plan.price = Number(price);
    if (duration_days !== undefined) plan.duration_days = Number(duration_days);
    if (is_active !== undefined) plan.is_active = is_active;

    await plan.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật gói dịch vụ thành công.",
      data: plan,
    });
  } catch (error) {
    console.error("Update Plan Error:", error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi cập nhật gói dịch vụ.",
    });
  }
};

// @desc    Delete plan (Admin)
// @route   DELETE /api/admin/plans/:id
// @access  Private/Admin
const deletePlan = async (req, res) => {
  try {
    const planId = req.params.id;

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy gói dịch vụ.",
      });
    }

    // Check if any payments are referencing this plan_id
    const hasPayments = await Payment.findOne({ plan_id: planId });
    if (hasPayments) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa gói dịch vụ đã phát sinh giao dịch thanh toán.",
      });
    }

    await SubscriptionPlan.findByIdAndDelete(planId);

    return res.status(200).json({
      success: true,
      message: "Xóa gói dịch vụ thành công.",
    });
  } catch (error) {
    console.error("Delete Plan Error:", error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi xóa gói dịch vụ.",
    });
  }
};

// @desc    Get dashboard metrics (Admin)
// @route   GET /api/admin/plans/dashboard
// @access  Private/Admin
const getDashboardMetrics = async (req, res) => {
  try {
    // 1. Total Revenue
    const revenueResult = await Payment.aggregate([
      { $match: { status: "PAID" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // 2. Successful transactions count
    const successfulTxCount = await Payment.countDocuments({ status: "PAID" });

    // 3. Pro users count
    const proUsersCount = await User.countDocuments({ isPro: true });

    // 4. Best Selling Plan
    const bestSellingResult = await Payment.aggregate([
      { $match: { status: "PAID" } },
      { $group: { _id: "$plan_id", count: { $sum: 1 }, revenue: { $sum: "$amount" } } },
      { $sort: { count: -1 } },
    ]);

    // Populate plan names manually to handle cases where plan_id might be null/deleted
    const bestSellingPlans = await Promise.all(
      bestSellingResult.map(async (item) => {
        let name = "Gói Pro (Mặc định cũ)";
        let slug = "pro";
        if (item._id) {
          const plan = await SubscriptionPlan.findById(item._id);
          if (plan) {
            name = plan.name;
            slug = plan.slug;
          }
        }
        return {
          plan_id: item._id,
          name,
          slug,
          salesCount: item.count,
          totalRevenue: item.revenue,
        };
      })
    );

    // 5. Monthly Revenue for the last 6 months
    const monthlyResult = await Payment.aggregate([
      { $match: { status: "PAID", paid_at: { $ne: null } } },
      {
        $group: {
          _id: {
            year: { $year: "$paid_at" },
            month: { $month: "$paid_at" },
          },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
    ]);

    const monthlyRevenue = monthlyResult.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      monthStr: `Tháng ${item._id.month}/${item._id.year}`,
      revenue: item.revenue,
      count: item.count,
    })).reverse();

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        successfulTxCount,
        proUsersCount,
        bestSellingPlans,
        monthlyRevenue,
      },
    });
  } catch (error) {
    console.error("Get Dashboard Metrics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi lấy số liệu thống kê.",
    });
  }
};

module.exports = {
  getActivePlans,
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getDashboardMetrics,
};
