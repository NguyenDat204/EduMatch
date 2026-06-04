const User = require("../models/User");
const Career = require("../models/Career");
const University = require("../models/University");
const Article = require("../models/Article");
const Feedback = require("../models/Feedback");
const SurveyHistory = require("../models/SurveyHistory");
const SystemSettings = require("../models/SystemSettings");
const UserInteraction = require("../models/UserInteraction");

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
    const userCount = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: "student" });
    const adminCount = await User.countDocuments({ role: "admin" });
    const careerCount = await Career.countDocuments();
    const universityCount = await University.countDocuments();
    const articleCount = await Article.countDocuments();
    const feedbackCount = await Feedback.countDocuments();

    // Average feedback rating
    const ratingAggregate = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" }
        }
      }
    ]);
    const averageRating = ratingAggregate.length > 0 ? Number(ratingAggregate[0].averageRating.toFixed(1)) : 5.0;

    // Growth rates and sample metrics for dashboard presentation
    const recentSignups = await User.find()
      .select("name email role createdAt academicInfo")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentFeedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentSurveys = await SurveyHistory.find()
      .populate("userId", "name email academicInfo")
      .sort({ completedAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        counts: {
          users: userCount,
          students: studentCount,
          admins: adminCount,
          careers: careerCount,
          universities: universityCount,
          articles: articleCount,
          feedbacks: feedbackCount,
        },
        averageRating,
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
