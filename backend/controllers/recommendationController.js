const aiService = require("../services/aiService");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getRecommendations = async (req, res) => {
  try {
    const userData = req.body;
    if (!userData) {
      return res.status(400).json({ message: "User data is required" });
    }

    const recommendations = await aiService.getCareerRecommendations(userData);

    // Optional user profiles recording if token is attached
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "edumatchsecret123");
        const user = await User.findById(decoded.id);
        
        if (user) {
          user.personalityTest = {
            archetype: recommendations.archetype,
            description: recommendations.description,
            suitabilityScore: recommendations.suitabilityScore,
            insights: recommendations.insights,
            careers: recommendations.careers,
            answers: userData.answers || {},
            updatedAt: new Date()
          };
          await user.save();
          console.log(`Saved AI survey recommendation for user ${user.name}`);
        }
      } catch (tokenErr) {
        console.warn("Failed to automatically record survey results to user:", tokenErr.message);
      }
    }

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
