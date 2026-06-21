const User = require("../models/User");
const Career = require("../models/Career");
const University = require("../models/University");
const Article = require("../models/Article");
const Feedback = require("../models/Feedback");
const SurveyHistory = require("../models/SurveyHistory");
const SystemSettings = require("../models/SystemSettings");
const UserInteraction = require("../models/UserInteraction");

const CAREER_CATEGORY_ANALYTICS_LIMIT = 8;

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
    const range = buildDateRange(14);
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
      ratingDistribution,
      careerCategoryDistribution,
      careerCategoryRecommendations,
      topRecommendedCareers,
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
        },
        averageRating,
        completionRate: userCount ? Math.round((completedSurveyUserCount.length / userCount) * 100) : 0,
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
        },
        trends: {
          users: fillDailySeries(range, userGrowthRows),
          surveys: fillDailySeries(range, surveyTrendRows),
          feedbacks: fillDailySeries(range, feedbackTrendRows),
        },
        topRecommendedCareers: topRecommendedCareers.map((row) => ({
          title: row._id || "Không rõ",
          count: row.count,
          avgSuitability: Math.round(row.avgSuitability || 0),
          category: row.category || "",
        })),
        recentSignups,
        recentFeedbacks,
        recentSurveys,
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
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.json({ success: true, data: settings });
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
      settings = new SystemSettings({});
    }
    settings.maintenanceMode = req.body.maintenanceMode !== undefined ? req.body.maintenanceMode : settings.maintenanceMode;
    settings.allowRegistration = req.body.allowRegistration !== undefined ? req.body.allowRegistration : settings.allowRegistration;
    settings.appTitle = req.body.appTitle !== undefined ? req.body.appTitle : settings.appTitle;
    settings.aiModel = req.body.aiModel !== undefined ? req.body.aiModel : settings.aiModel;
    settings.maxChatHistory = req.body.maxChatHistory !== undefined ? req.body.maxChatHistory : settings.maxChatHistory;
    settings.surveyThreshold = req.body.surveyThreshold !== undefined ? req.body.surveyThreshold : settings.surveyThreshold;
    settings.systemPromptTemplate = req.body.systemPromptTemplate !== undefined ? req.body.systemPromptTemplate : settings.systemPromptTemplate;

    const updatedSettings = await settings.save();
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
  getSystemSettings,
  updateSystemSettings,
  getUserActivity,
};
