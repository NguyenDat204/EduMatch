const aiService = require("../services/aiService");
const User = require("../models/User");

// @desc    Get AI Advisor Chat response with user profile context
// @route   POST /api/chat
// @access  Private
const getChatAdvisorResponse = async (req, res) => {
  try {
    const { chatHistory } = req.body;

    if (!chatHistory || !Array.isArray(chatHistory) || chatHistory.length === 0) {
      return res.status(400).json({ message: "Chat history is required" });
    }

    // Load full user details to give Gemini complete student context
    const user = await User.findById(req.user._id).select("-password");

    const aiResponse = await aiService.getChatResponse(chatHistory, user);

    res.json({
      success: true,
      data: {
        role: "ai",
        content: aiResponse
      }
    });
  } catch (error) {
    console.error("Chat Controller Error:", error);
    res.status(500).json({ 
      message: "Advisor connection issue", 
      error: error.message 
    });
  }
};

module.exports = { getChatAdvisorResponse };
