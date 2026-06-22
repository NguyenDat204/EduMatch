const crypto = require("crypto");
const RecommendationFeedback = require("../models/RecommendationFeedback");

const sanitizeText = (value, max = 1000) =>
  value ? String(value).replace(/<[^>]+>/g, "").trim().slice(0, max) : "";

const buildFingerprint = (result = {}) => {
  const payload = {
    archetype: result.archetype || "",
    hollandCode: result.hollandCode || "",
    topCareerTitle: result.careers?.[0]?.title || "",
    suitabilityScore: result.suitabilityScore || 0,
  };
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
};

const submitRecommendationFeedback = async (req, res) => {
  try {
    const { result, surveyHistoryId, perceivedAccuracy, topCareerFit, comment } = req.body;
    const accuracy = Number(perceivedAccuracy);

    if (!result || typeof result !== "object") {
      return res.status(400).json({ success: false, message: "Recommendation result is required" });
    }
    if (!Number.isFinite(accuracy) || accuracy < 1 || accuracy > 5) {
      return res.status(400).json({ success: false, message: "perceivedAccuracy must be 1-5" });
    }

    const safeTopCareerFit = ["interested", "unsure", "not_interested"].includes(topCareerFit)
      ? topCareerFit
      : "unsure";
    const fingerprint = buildFingerprint(result);

    const feedback = await RecommendationFeedback.findOneAndUpdate(
      { userId: req.user._id, resultFingerprint: fingerprint },
      {
        $set: {
          userId: req.user._id,
          surveyHistoryId: surveyHistoryId || undefined,
          resultFingerprint: fingerprint,
          archetype: sanitizeText(result.archetype, 200),
          hollandCode: sanitizeText(result.hollandCode, 20),
          topCareerTitle: sanitizeText(result.careers?.[0]?.title, 200),
          perceivedAccuracy: accuracy,
          topCareerFit: safeTopCareerFit,
          comment: sanitizeText(comment, 1000),
          scoreSnapshot: {
            suitabilityScore: Number(result.suitabilityScore || 0),
            confidence: result.confidence || {},
            scoreBreakdown: result.scoreBreakdown || {},
            riasecScores: result.riasecScores || {},
            method: sanitizeText(result.method, 100),
          },
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    console.error("submitRecommendationFeedback Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRecommendationFeedbackAnalytics = async (req, res) => {
  try {
    const [summary] = await RecommendationFeedback.aggregate([
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgAccuracy: { $avg: "$perceivedAccuracy" },
          interestedCount: {
            $sum: { $cond: [{ $eq: ["$topCareerFit", "interested"] }, 1, 0] },
          },
          notInterestedCount: {
            $sum: { $cond: [{ $eq: ["$topCareerFit", "not_interested"] }, 1, 0] },
          },
        },
      },
    ]);

    const byCareer = await RecommendationFeedback.aggregate([
      {
        $group: {
          _id: "$topCareerTitle",
          count: { $sum: 1 },
          avgAccuracy: { $avg: "$perceivedAccuracy" },
          interestedCount: {
            $sum: { $cond: [{ $eq: ["$topCareerFit", "interested"] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1, avgAccuracy: 1 } },
      { $limit: 20 },
    ]);

    res.json({
      success: true,
      data: {
        summary: summary || { count: 0, avgAccuracy: 0, interestedCount: 0, notInterestedCount: 0 },
        byCareer,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  submitRecommendationFeedback,
  getRecommendationFeedbackAnalytics,
};
