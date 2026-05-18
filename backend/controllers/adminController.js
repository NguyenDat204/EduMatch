const User = require("../models/User");
const Career = require("../models/Career");
const University = require("../models/University");
const Article = require("../models/Article");
const Feedback = require("../models/Feedback");

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

    // Growth rates, mock metrics for dashboard presentation
    const recentSignups = await User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentFeedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
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
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error loading analytics", error: error.message });
  }
};

module.exports = {
  getUsers,
  updateUser,
  deleteUser,
  getSystemAnalytics,
};
