const aiService = require("../services/aiService");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const CareerRecommendation = require("../models/CareerRecommendation");
const UserInteraction = require("../models/UserInteraction");

const getRecommendations = async (req, res) => {
  try {
    const userData = req.body;
    if (!userData || typeof userData !== 'object') {
      return res.status(400).json({ message: "User data is required and must be an object" });
    }

    const recommendations = await aiService.getCareerRecommendations(userData);

    // Basic sanitizer to avoid saving unbounded AI content
    const sanitizeText = (s, max = 2000) => {
      if (!s) return "";
      return String(s).replace(/<[^>]+>/g, '').slice(0, max);
    };

    const sanitizeCareer = (c) => {
      if (!c || typeof c !== 'object') return null;
      return {
        title: sanitizeText(c.title || c.name || '', 200),
        id: c.id || c._id || null,
        description: sanitizeText(c.description || c.summary || '', 500),
        salary: sanitizeText(c.salary || 'Chưa xác định', 100),
        growth: sanitizeText(c.growth || 'Ổn định', 100),
        skills: Array.isArray(c.skills)
          ? c.skills.map((skill) => sanitizeText(skill, 80)).filter(Boolean)
          : [],
        suitability: Number.isFinite(c.suitability) ? c.suitability : 0,
        meetsSurveyThreshold: Boolean(c.meetsSurveyThreshold),
        category: sanitizeText(c.category || '', 100),
        scoreBreakdown: c.scoreBreakdown && typeof c.scoreBreakdown === 'object'
          ? c.scoreBreakdown
          : {},
        roadmap: Array.isArray(c.roadmap)
          ? c.roadmap
              .map((step) => ({
                phase: sanitizeText(step.phase || '', 100),
                title: sanitizeText(step.title || '', 100),
                duration: sanitizeText(step.duration || '', 100),
                description: sanitizeText(step.description || '', 300),
                skillsToAcquire: Array.isArray(step.skillsToAcquire)
                  ? step.skillsToAcquire.map((skill) => sanitizeText(skill, 80)).filter(Boolean)
                  : []
              }))
              .filter((step) => step.title && step.description)
          : [],
      };
    };

    const safeRecommendations = {
      archetype: sanitizeText(recommendations?.archetype || '', 200),
      hollandCode: sanitizeText(recommendations?.hollandCode || '', 20),
      description: sanitizeText(recommendations?.description || '', 2000),
      suitabilityScore: Number(recommendations?.suitabilityScore || 0),
      insights: sanitizeText(recommendations?.insights || '', 2000),
      riasecScores: recommendations?.riasecScores && typeof recommendations.riasecScores === 'object'
        ? recommendations.riasecScores
        : {},
      scoreBreakdown: recommendations?.scoreBreakdown && typeof recommendations.scoreBreakdown === 'object'
        ? recommendations.scoreBreakdown
        : {},
      confidence: recommendations?.confidence && typeof recommendations.confidence === 'object'
        ? recommendations.confidence
        : {},
      method: sanitizeText(recommendations?.method || '', 100),
      surveyThreshold: Number(recommendations?.surveyThreshold || 0),
      careers: Array.isArray(recommendations?.careers)
        ? recommendations.careers.map(sanitizeCareer).filter(Boolean).slice(0, 12)
        : [],
    };

    // Optional user profiles recording if token is attached
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (user) {
          user.personalityTest = {
            archetype: safeRecommendations.archetype,
            description: safeRecommendations.description,
            suitabilityScore: safeRecommendations.suitabilityScore,
            insights: safeRecommendations.insights,
            hollandCode: safeRecommendations.hollandCode,
            riasecScores: safeRecommendations.riasecScores,
            scoreBreakdown: safeRecommendations.scoreBreakdown,
            confidence: safeRecommendations.confidence,
            method: safeRecommendations.method,
            surveyThreshold: safeRecommendations.surveyThreshold,
            careers: safeRecommendations.careers,
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

    // Return sanitized recommendations to client
    res.json(safeRecommendations);
  } catch (error) {
    console.error("Recommendation Controller Error:", error);
    res.status(500).json({
      message: "Internal server error during analysis",
      error: error.message
    });
  }
};

// @desc    Get user's recommendations
// @route   GET /api/recommendations
// @access  Private
const getUserRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, sort = "-generatedAt" } = req.query;

    const recommendations = await CareerRecommendation.find({ userId })
      .populate("recommendedCareers.careerId", "title category salary skills")
      .sort(sort)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get latest recommendation
// @route   GET /api/recommendations/latest
// @access  Private
const getLatestRecommendation = async (req, res) => {
  try {
    const userId = req.user.id;

    const recommendation = await CareerRecommendation.findOne({ userId })
      .populate("recommendedCareers.careerId")
      .sort("-generatedAt");

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: "No recommendations found. Please generate recommendations first.",
      });
    }

    res.status(200).json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Accept/validate recommendation
// @route   POST /api/recommendations/:id/accept
// @access  Private
const acceptRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAccepted, rating, comment } = req.body;
    const userId = req.user.id;

    const recommendation = await CareerRecommendation.findOneAndUpdate(
      { _id: id, userId },
      {
        isAccepted,
        userFeedback: {
          rating,
          comment,
        },
      },
      { returnDocument: 'after' }
    );

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: "Recommendation not found",
      });
    }

    // Track user interaction
    await UserInteraction.create({
      userId,
      action: "chat_about",
      metadata: {
        feedback: isAccepted,
      },
      timestamp: new Date(),
    });

    res.status(200).json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getRecommendations,
  getUserRecommendations,
  getLatestRecommendation,
  acceptRecommendation
};
