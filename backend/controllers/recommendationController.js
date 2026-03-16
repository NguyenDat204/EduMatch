const aiService = require("../services/aiService");

const getRecommendations = async (req, res) => {
  try {
    const userData = req.body;
    if (!userData) {
      return res.status(400).json({ message: "User data is required" });
    }

    const recommendations = await aiService.getCareerRecommendations(userData);
    res.json(recommendations);
  } catch (error) {
    console.error("Recommendation Controller Error:", error);
    res.status(500).json({ 
      message: "Internal server error during analysis",
      error: error.message 
    });
  }
};

module.exports = { getRecommendations };
