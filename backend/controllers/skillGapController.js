const SkillGapAnalysis = require("../models/SkillGapAnalysis");
const Career = require("../models/Career");
const User = require("../models/User");

// @desc    Analyze skill gaps for a career
// @route   POST /api/analytics/skill-gap
// @access  Private
const analyzeSkillGap = async (req, res) => {
  try {
    const userId = req.user.id;
    const { careerId } = req.body;

    if (!careerId) {
      return res.status(400).json({
        success: false,
        message: "Career ID is required",
      });
    }

    const user = await User.findById(userId);
    const career = await Career.findById(careerId);

    if (!career) {
      return res.status(404).json({
        success: false,
        message: "Career not found",
      });
    }

    // Get user's current skills from skill evaluation
    const currentSkills = new Map();
    if (user.skillEvaluation && user.skillEvaluation.scores) {
      Object.entries(user.skillEvaluation.scores).forEach(([skill, level]) => {
        currentSkills.set(skill, {
          level: level || 0,
          yearsOfExperience: 0,
          lastUpdated: new Date(),
        });
      });
    }

    // Convert career skills to required skills map
    const requiredSkills = new Map();
    if (career.skills && Array.isArray(career.skills)) {
      career.skills.forEach((skill, index) => {
        requiredSkills.set(skill, {
          level: 7 + Math.floor(Math.random() * 3), // 7-10 required level
          importance:
            index < 3
              ? "critical"
              : index < 5
              ? "high"
              : index < 7
              ? "medium"
              : "nice_to_have",
        });
      });
    }

    // Calculate skill gaps
    const skillGaps = [];
    let totalGapScore = 0;
    let gapCount = 0;

    requiredSkills.forEach((requiredData, skillName) => {
      const currentData = currentSkills.get(skillName) || { level: 0 };
      const gap = Math.max(0, requiredData.level - currentData.level);

      if (gap > 0) {
        gapCount++;
        totalGapScore += gap;

        skillGaps.push({
          skillName,
          currentLevel: currentData.level,
          requiredLevel: requiredData.level,
          gap,
          priority:
            gap > 5
              ? "urgent"
              : gap > 3
              ? "high"
              : gap > 1
              ? "medium"
              : "low",
          improvementStrategy: generateImprovementStrategy(skillName),
          recommendedResources: generateResources(skillName),
        });
      }
    });

    // Calculate overall gap score (0 = ready, 100 = not ready)
    const overallGapScore = Math.min(100, Math.ceil((totalGapScore / (gapCount * 10)) * 100));
    const timeToReadiness = estimateTimeToReadiness(skillGaps);

    const analysis = await SkillGapAnalysis.create({
      userId,
      careerId,
      currentSkills,
      requiredSkills,
      skillGaps,
      overallGapScore,
      timeToReadiness,
      analysisDate: new Date(),
    });

    res.status(201).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get skill gap analysis for a career
// @route   GET /api/analytics/skill-gap/:careerId
// @access  Private
const getSkillGapAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    const { careerId } = req.params;

    const analysis = await SkillGapAnalysis.findOne({
      userId,
      careerId,
    })
      .populate("careerId", "title description salary skills")
      .sort("-analysisDate");

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "No skill gap analysis found. Generate one first.",
      });
    }

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all skill gap analyses for user
// @route   GET /api/analytics/skill-gaps
// @access  Private
const getUserSkillGaps = async (req, res) => {
  try {
    const userId = req.user.id;

    const analyses = await SkillGapAnalysis.find({ userId })
      .populate("careerId", "title salary")
      .sort("-analysisDate")
      .limit(20);

    res.status(200).json({
      success: true,
      count: analyses.length,
      data: analyses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper: Generate improvement strategy
const generateImprovementStrategy = (skillName) => {
  const strategies = {
    technical: "Take online coding courses (Coursera, Udemy), build personal projects",
    creative: "Practice design, join creative communities, work on portfolio projects",
    communication: "Join toastmasters, practice public speaking, take workshops",
    analytical: "Study statistics, solve coding challenges, analyze case studies",
    leadership: "Lead team projects, take management courses, mentor others",
  };

  return (
    strategies[skillName] || `Focus on practical experience and continuous learning in ${skillName}`
  );
};

// Helper: Generate resources
const generateResources = (skillName) => {
  const resourceMap = {
    technical: [
      { title: "freeCodeCamp", type: "course", url: "https://freecodecamp.org" },
      { title: "LeetCode", type: "practice", url: "https://leetcode.com" },
    ],
    creative: [
      { title: "Figma Tutorials", type: "course", url: "https://figma.com/resources" },
      { title: "Dribbble", type: "project", url: "https://dribbble.com" },
    ],
  };

  return resourceMap[skillName] || [{ title: `Learn ${skillName}`, type: "course", url: "#" }];
};

// Helper: Estimate time to readiness
const estimateTimeToReadiness = (skillGaps) => {
  if (!skillGaps || skillGaps.length === 0) return "Ready now";

  const urgentCount = skillGaps.filter((g) => g.priority === "urgent").length;
  const highCount = skillGaps.filter((g) => g.priority === "high").length;

  if (urgentCount >= 3) return "6-12 months";
  if (urgentCount > 0 || highCount >= 3) return "3-6 months";
  if (highCount > 0) return "1-3 months";
  return "Less than 1 month";
};

module.exports = {
  analyzeSkillGap,
  getSkillGapAnalysis,
  getUserSkillGaps,
};
