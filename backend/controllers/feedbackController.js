const Feedback = require("../models/Feedback");

// @desc    Submit new feedback
// @route   POST /api/feedback
// @access  Public (Optional auth)
const submitFeedback = async (req, res) => {
  try {
    const { name, email, message, rating } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const feedbackData = {
      name,
      email,
      message,
      rating: Number(rating) || 5,
    };

    // Attach userId if request is authenticated
    if (req.user) {
      feedbackData.userId = req.user._id;
    }

    const feedback = await Feedback.create(feedbackData);
    res.status(201).json({ success: true, message: "Feedback submitted successfully", data: feedback });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all feedback (Admin only)
// @route   GET /api/feedback
// @access  Private/Admin
const getFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json({ success: true, data: feedbacks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    await feedback.deleteOne();
    res.json({ success: true, message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  submitFeedback,
  getFeedback,
  deleteFeedback,
};
