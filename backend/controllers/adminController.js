const User = require("../models/User");
const Career = require("../models/Career");
const University = require("../models/University");
const Article = require("../models/Article");
const Feedback = require("../models/Feedback");
const SurveyHistory = require("../models/SurveyHistory");
const SystemSettings = require("../models/SystemSettings");
const UserInteraction = require("../models/UserInteraction");
const Payment = require("../models/Payment");
const ChatHistory = require("../models/ChatHistory");
const RecommendationFeedback = require("../models/RecommendationFeedback");
const {
  DEFAULT_SETTINGS,
  getSystemSettings: getRuntimeSystemSettings,
  invalidateSystemSettingsCache,
  validateSettingsPayload,
} = require("../services/systemSettingsService");

const CAREER_CATEGORY_ANALYTICS_LIMIT = 8;

const ANALYTICS_PERIODS = {
  week: { days: 7, label: "7 ngày", granularity: "day" },
  month: { days: 30, label: "30 ngày", granularity: "day" },
  year: { days: 365, label: "365 ngày", granularity: "day" },
};

const resolveAnalyticsPeriod = (period = "month") => (
  ANALYTICS_PERIODS[period] ? { key: period, ...ANALYTICS_PERIODS[period] } : { key: "month", ...ANALYTICS_PERIODS.month }
);

const buildDateRange = (days = 14) => {
  const dates = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push({
      date: d,
      key: d.toISOString().slice(0, 10),
      label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
    });
  }

  return dates;
};

const fillDailySeries = (range, rows, valueKey = "count") => {
  const valuesByDate = new Map(rows.map((row) => [row._id, row[valueKey] || 0]));
  return range.map((item) => ({
    date: item.key,
    label: item.label,
    value: valuesByDate.get(item.key) || 0,
  }));
};

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update user details or role (Admin only)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.isPro = req.body.isPro !== undefined ? req.body.isPro : user.isPro;

      const updatedUser = await user.save();
      res.json({ success: true, data: updatedUser });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }

    await user.deleteOne();
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get system wide analytics (Admin only)
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getSystemAnalytics = async (req, res) => {
  try {
    const period = resolveAnalyticsPeriod(req.query.period);
    const range = buildDateRange(period.days);
    const fromDate = range[0].date;

    const [
      userCount,
      studentCount,
      adminCount,
      universityRoleCount,
      proCount,
      careerCount,
      universityCount,
      articleCount,
      feedbackCount,
      surveyCount,
      ratingAggregate,
      roleDistribution,
      userGrowthRows,
      surveyTrendRows,
      feedbackTrendRows,
      chatTrendRows,
      paymentTrendRows,
      recommendationFeedbackTrendRows,
      ratingDistribution,
      careerCategoryDistribution,
      careerCategoryRecommendations,
      topRecommendedCareers,
      surveyQualityAggregate,
      recommendationFeedbackCount,
      recommendationFeedbackAggregate,
      recommendationFeedbackFitDistribution,
      recommendationFeedbackByCareer,
      paymentStatusDistribution,
      paymentRevenueAggregate,
      chatCount,
      chatMessageAggregate,
      activityCount,
      recentRecommendationFeedbacks,
      recentPayments,
      recentSignups,
      recentFeedbacks,
      recentSurveys,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "university" }),
      User.countDocuments({ isPro: true }),
      Career.countDocuments(),
      University.countDocuments(),
      Article.countDocuments(),
      Feedback.countDocuments(),
      SurveyHistory.countDocuments(),
      Feedback.aggregate([
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" }
          }
        }
      ]),
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: fromDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      SurveyHistory.aggregate([
        { $match: { completedAt: { $gte: fromDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Feedback.aggregate([
        { $match: { createdAt: { $gte: fromDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      ChatHistory.aggregate([
        { $match: { lastMessageTime: { $gte: fromDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$lastMessageTime" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Payment.aggregate([
        { $match: { created_at: { $gte: fromDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } }, count: { $sum: 1 }, revenue: { $sum: { $cond: [{ $eq: ["$status", "PAID"] }, "$amount", 0] } } } },
        { $sort: { _id: 1 } }
      ]),
      RecommendationFeedback.aggregate([
        { $match: { createdAt: { $gte: fromDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Feedback.aggregate([
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Career.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: CAREER_CATEGORY_ANALYTICS_LIMIT }
      ]),
      SurveyHistory.aggregate([
        { $unwind: "$result.careers" },
        {
          $lookup: {
            from: "careers",
            localField: "result.careers.title",
            foreignField: "title",
            as: "matchedCareer"
          }
        },
        { $unwind: { path: "$matchedCareer", preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            resolvedCategory: {
              $ifNull: [
                {
                  $cond: [
                    { $eq: ["$result.careers.category", ""] },
                    null,
                    "$result.careers.category"
                  ]
                },
                "$matchedCareer.category"
              ]
            },
            resolvedSuitability: {
              $ifNull: ["$result.careers.suitability", "$result.suitabilityScore"]
            }
          }
        },
        {
          $match: {
            resolvedCategory: { $exists: true, $ne: "" }
          }
        },
        {
          $group: {
            _id: "$resolvedCategory",
            count: { $sum: 1 },
            avgSuitability: { $avg: "$resolvedSuitability" },
          }
        },
        { $sort: { count: -1, _id: 1 } }
      ]),
      SurveyHistory.aggregate([
        { $unwind: "$result.careers" },
        {
          $lookup: {
            from: "careers",
            localField: "result.careers.title",
            foreignField: "title",
            as: "matchedCareer"
          }
        },
        { $unwind: { path: "$matchedCareer", preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            resolvedTitle: {
              $ifNull: ["$result.careers.title", "$matchedCareer.title"]
            },
            resolvedCategory: {
              $ifNull: [
                {
                  $cond: [
                    { $eq: ["$result.careers.category", ""] },
                    null,
                    "$result.careers.category"
                  ]
                },
                "$matchedCareer.category"
              ]
            },
            resolvedSuitability: {
              $ifNull: ["$result.careers.suitability", "$result.suitabilityScore"]
            }
          }
        },
        {
          $match: {
            resolvedTitle: { $exists: true, $ne: "" }
          }
        },
        {
          $group: {
            _id: "$resolvedTitle",
            count: { $sum: 1 },
            avgSuitability: { $avg: "$resolvedSuitability" },
            category: { $first: "$resolvedCategory" }
          }
        },
        { $sort: { count: -1, avgSuitability: -1 } },
        { $limit: 8 }
      ]),
      SurveyHistory.aggregate([
        {
          $group: {
            _id: null,
            avgSuitability: { $avg: "$result.suitabilityScore" },
            avgConfidence: { $avg: "$result.confidence.score" },
            highConfidenceCount: {
              $sum: { $cond: [{ $eq: ["$result.confidence.level", "high"] }, 1, 0] }
            },
            mediumConfidenceCount: {
              $sum: { $cond: [{ $eq: ["$result.confidence.level", "medium"] }, 1, 0] }
            },
            exploratoryConfidenceCount: {
              $sum: { $cond: [{ $eq: ["$result.confidence.level", "exploratory"] }, 1, 0] }
            },
          }
        }
      ]),
      RecommendationFeedback.countDocuments(),
      RecommendationFeedback.aggregate([
        {
          $group: {
            _id: null,
            avgAccuracy: { $avg: "$perceivedAccuracy" },
            avgSuitabilityAtFeedback: { $avg: "$scoreSnapshot.suitabilityScore" },
            avgConfidenceAtFeedback: { $avg: "$scoreSnapshot.confidence.score" },
            interestedCount: {
              $sum: { $cond: [{ $eq: ["$topCareerFit", "interested"] }, 1, 0] }
            },
            unsureCount: {
              $sum: { $cond: [{ $eq: ["$topCareerFit", "unsure"] }, 1, 0] }
            },
            notInterestedCount: {
              $sum: { $cond: [{ $eq: ["$topCareerFit", "not_interested"] }, 1, 0] }
            },
          }
        }
      ]),
      RecommendationFeedback.aggregate([
        { $group: { _id: "$topCareerFit", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      RecommendationFeedback.aggregate([
        {
          $group: {
            _id: "$topCareerTitle",
            count: { $sum: 1 },
            avgAccuracy: { $avg: "$perceivedAccuracy" },
            interestedCount: {
              $sum: { $cond: [{ $eq: ["$topCareerFit", "interested"] }, 1, 0] }
            },
            notInterestedCount: {
              $sum: { $cond: [{ $eq: ["$topCareerFit", "not_interested"] }, 1, 0] }
            },
          }
        },
        { $sort: { count: -1, avgAccuracy: 1 } },
        { $limit: 8 }
      ]),
      Payment.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$amount" } } },
        { $sort: { count: -1 } }
      ]),
      Payment.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $cond: [{ $eq: ["$status", "PAID"] }, "$amount", 0] } },
            paidCount: { $sum: { $cond: [{ $eq: ["$status", "PAID"] }, 1, 0] } },
            pendingCount: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] } },
            failedCount: { $sum: { $cond: [{ $in: ["$status", ["FAILED", "CANCELLED"]] }, 1, 0] } },
          }
        }
      ]),
      ChatHistory.countDocuments(),
      ChatHistory.aggregate([
        {
          $project: {
            messageCount: { $size: { $ifNull: ["$messages", []] } },
            inputTokens: "$totalTokens.input",
            outputTokens: "$totalTokens.output",
          }
        },
        {
          $group: {
            _id: null,
            totalMessages: { $sum: "$messageCount" },
            avgMessagesPerConversation: { $avg: "$messageCount" },
            totalInputTokens: { $sum: "$inputTokens" },
            totalOutputTokens: { $sum: "$outputTokens" },
          }
        }
      ]),
      UserInteraction.countDocuments(),
      RecommendationFeedback.find()
        .populate("userId", "name email academicInfo")
        .sort({ createdAt: -1 })
        .limit(5),
      Payment.find()
        .populate("user_id", "name email")
        .populate("plan_id", "name slug")
        .sort({ created_at: -1 })
        .limit(5),
      User.find()
        .select("name email role createdAt academicInfo isPro")
        .sort({ createdAt: -1 })
        .limit(5),
      Feedback.find()
        .populate("userId", "name email role academicInfo")
        .sort({ createdAt: -1 })
        .limit(5),
      SurveyHistory.find()
        .populate("userId", "name email academicInfo")
        .sort({ completedAt: -1 })
        .limit(5),
    ]);

    const averageRating = ratingAggregate.length > 0 ? Number(ratingAggregate[0].averageRating.toFixed(1)) : 5.0;
    const completedSurveyUserCount = await SurveyHistory.distinct("userId");
    const surveyQuality = surveyQualityAggregate[0] || {};
    const recommendationFeedbackSummary = recommendationFeedbackAggregate[0] || {};
    const paymentSummary = paymentRevenueAggregate[0] || {};
    const chatSummary = chatMessageAggregate[0] || {};

    res.json({
      success: true,
      data: {
        counts: {
          users: userCount,
          students: studentCount,
          admins: adminCount,
          universityUsers: universityRoleCount,
          proUsers: proCount,
          careers: careerCount,
          universities: universityCount,
          articles: articleCount,
          feedbacks: feedbackCount,
          surveys: surveyCount,
          recommendationFeedbacks: recommendationFeedbackCount,
          payments: paymentStatusDistribution.reduce((sum, row) => sum + row.count, 0),
          chats: chatCount,
          interactions: activityCount,
        },
        averageRating,
        completionRate: userCount ? Math.round((completedSurveyUserCount.length / userCount) * 100) : 0,
        period: {
          key: period.key,
          label: period.label,
          days: period.days,
          granularity: period.granularity,
          from: range[0]?.key,
          to: range[range.length - 1]?.key,
        },
        quality: {
          avgSuitability: Math.round(surveyQuality.avgSuitability || 0),
          avgConfidence: Math.round(surveyQuality.avgConfidence || 0),
          highConfidenceCount: surveyQuality.highConfidenceCount || 0,
          mediumConfidenceCount: surveyQuality.mediumConfidenceCount || 0,
          exploratoryConfidenceCount: surveyQuality.exploratoryConfidenceCount || 0,
          recommendationFeedbackCount,
          avgRecommendationAccuracy: Number((recommendationFeedbackSummary.avgAccuracy || 0).toFixed(1)),
          avgSuitabilityAtFeedback: Math.round(recommendationFeedbackSummary.avgSuitabilityAtFeedback || 0),
          avgConfidenceAtFeedback: Math.round(recommendationFeedbackSummary.avgConfidenceAtFeedback || 0),
          interestedCount: recommendationFeedbackSummary.interestedCount || 0,
          unsureCount: recommendationFeedbackSummary.unsureCount || 0,
          notInterestedCount: recommendationFeedbackSummary.notInterestedCount || 0,
        },
        monetization: {
          totalRevenue: paymentSummary.totalRevenue || 0,
          paidCount: paymentSummary.paidCount || 0,
          pendingCount: paymentSummary.pendingCount || 0,
          failedCount: paymentSummary.failedCount || 0,
          conversionRate: userCount ? Math.round(((paymentSummary.paidCount || 0) / userCount) * 100) : 0,
        },
        aiUsage: {
          chats: chatCount,
          totalMessages: chatSummary.totalMessages || 0,
          avgMessagesPerConversation: Number((chatSummary.avgMessagesPerConversation || 0).toFixed(1)),
          totalTokens: (chatSummary.totalInputTokens || 0) + (chatSummary.totalOutputTokens || 0),
          interactions: activityCount,
        },
        distributions: {
          roles: roleDistribution.map((row) => ({ label: row._id || "unknown", value: row.count })),
          ratings: [1, 2, 3, 4, 5].map((rating) => ({
            label: `${rating} sao`,
            value: ratingDistribution.find((row) => row._id === rating)?.count || 0,
          })),
          careerCategories: careerCategoryDistribution.map((row) => {
            const recommendationStats = careerCategoryRecommendations.find(
              (item) => (item._id || "") === (row._id || "")
            );
            const recommendationCount = recommendationStats?.count || 0;
            return {
              label: row._id || "Chưa phân loại",
              value: row.count,
              recommendationCount,
              avgSuitability: recommendationCount ? Math.round(recommendationStats.avgSuitability || 0) : null,
            };
          }),
          recommendationFit: ["interested", "unsure", "not_interested"].map((fit) => ({
            label: fit,
            value: recommendationFeedbackFitDistribution.find((row) => row._id === fit)?.count || 0,
          })),
          paymentStatuses: paymentStatusDistribution.map((row) => ({
            label: row._id || "UNKNOWN",
            value: row.count,
            amount: row.amount || 0,
          })),
        },
        trends: {
          users: fillDailySeries(range, userGrowthRows),
          surveys: fillDailySeries(range, surveyTrendRows),
          feedbacks: fillDailySeries(range, feedbackTrendRows),
          chats: fillDailySeries(range, chatTrendRows),
          recommendationFeedbacks: fillDailySeries(range, recommendationFeedbackTrendRows),
          payments: fillDailySeries(range, paymentTrendRows),
          revenue: fillDailySeries(range, paymentTrendRows, "revenue"),
        },
        topRecommendedCareers: topRecommendedCareers.map((row) => ({
          title: row._id || "Không rõ",
          count: row.count,
          avgSuitability: Math.round(row.avgSuitability || 0),
          category: row.category || "",
        })),
        recommendationFeedbackByCareer: recommendationFeedbackByCareer.map((row) => ({
          title: row._id || "Không rõ",
          count: row.count,
          avgAccuracy: Number((row.avgAccuracy || 0).toFixed(1)),
          interestedCount: row.interestedCount || 0,
          notInterestedCount: row.notInterestedCount || 0,
        })),
        recentSignups,
        recentFeedbacks,
        recentSurveys,
        recentRecommendationFeedbacks,
        recentPayments,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error loading analytics", error: error.message });
  }
};

// @desc    Get all survey histories of all users (Admin only)
// @route   GET /api/admin/surveys
// @access  Private/Admin
const getAllSurveyHistories = async (req, res) => {
  try {
    const histories = await SurveyHistory.find()
      .populate("userId", "name email academicInfo")
      .sort({ completedAt: -1 });
    res.json({ success: true, data: histories });
  } catch (error) {
    res.status(500).json({ message: "Server error loading survey histories", error: error.message });
  }
};

// @desc    Get all AI recommendation feedback records (Admin only)
// @route   GET /api/admin/recommendation-feedbacks
// @access  Private/Admin
const getAllRecommendationFeedbacks = async (req, res) => {
  try {
    const records = await RecommendationFeedback.find()
      .populate("userId", "name email academicInfo role")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ message: "Server error loading recommendation feedbacks", error: error.message });
  }
};

// @desc    Get all payments (Admin only)
// @route   GET /api/admin/payments
// @access  Private/Admin
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user_id", "name email role")
      .populate("plan_id", "name slug price duration_days")
      .sort({ created_at: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ message: "Server error loading payments", error: error.message });
  }
};

// @desc    Get all AI chat conversations (Admin only)
// @route   GET /api/admin/chats
// @access  Private/Admin
const getAllChatHistories = async (req, res) => {
  try {
    const chats = await ChatHistory.find()
      .populate("userId", "name email academicInfo role")
      .sort({ lastMessageTime: -1 });
    res.json({ success: true, data: chats });
  } catch (error) {
    res.status(500).json({ message: "Server error loading chat histories", error: error.message });
  }
};

// @desc    Get activity log for a specific user (Admin only)
// @route   GET /api/admin/users/:id/activity
// @access  Private/Admin
const getUserActivity = async (req, res) => {
  try {
    const userId = req.params.id;

    // All interaction logs for this user
    const interactions = await UserInteraction.find({ userId })
      .populate("universityId", "name logo")
      .populate("careerId", "title")
      .populate("articleId", "title")
      .sort({ timestamp: -1 })
      .limit(100);

    // Favourite universities (saved)
    const favouriteUnis = await UserInteraction.find({
      userId,
      action: "save_favorite",
      universityId: { $exists: true },
    }).populate("universityId", "name logo location");

    // Survey histories for this user
    const surveys = await SurveyHistory.find({ userId })
      .sort({ completedAt: -1 });

    res.json({
      success: true,
      data: { interactions, favouriteUnis, surveys },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get system settings (Admin only)
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne().lean();
    if (!settings) {
      settings = (await SystemSettings.create(DEFAULT_SETTINGS)).toObject();
    }
    const normalizedSettings = await getRuntimeSystemSettings({ force: true });
    res.json({ success: true, data: { ...settings, ...normalizedSettings } });
  } catch (error) {
    res.status(500).json({ message: "Server error loading settings", error: error.message });
  }
};

// @desc    Update system settings (Admin only)
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings(DEFAULT_SETTINGS);
    }

    const { sanitized, errors } = validateSettingsPayload({
      ...settings.toObject(),
      ...req.body,
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join(" "),
        errors,
      });
    }

    settings.maintenanceMode = sanitized.maintenanceMode;
    settings.allowRegistration = sanitized.allowRegistration;
    settings.appTitle = sanitized.appTitle;
    settings.aiModel = sanitized.aiModel;
    settings.maxChatHistory = sanitized.maxChatHistory;
    settings.surveyThreshold = sanitized.surveyThreshold;
    settings.systemPromptTemplate = sanitized.systemPromptTemplate;

    const updatedSettings = await settings.save();
    invalidateSystemSettingsCache();
    res.json({ success: true, data: updatedSettings });
  } catch (error) {
    res.status(500).json({ message: "Server error updating settings", error: error.message });
  }
};

module.exports = {
  getUsers,
  updateUser,
  deleteUser,
  getSystemAnalytics,
  getAllSurveyHistories,
  getAllRecommendationFeedbacks,
  getAllPayments,
  getAllChatHistories,
  getSystemSettings,
  updateSystemSettings,
  getUserActivity,
};
