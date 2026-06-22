const SurveyHistory = require("../models/SurveyHistory");

// @desc  Save a completed survey + AI result
// @route POST /api/survey-history
// @access Private
const saveSurveyResult = async (req, res) => {
  try {
    const { answers, result, title } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ success: false, message: 'Answers are required' });
    }

    // sanitize helpers
    const sanitizeText = (s, max = 2000) => (s ? String(s).replace(/<[^>]+>/g, '').slice(0, max) : '');
    const sanitizeCareer = (c) => {
      if (!c || typeof c !== 'object') return null;
      return {
        title: sanitizeText(c.title || c.name || '' , 200),
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
                  : [],
              }))
              .filter((step) => step.title && step.description)
          : [],
      };
    };

    const safeResult = result && typeof result === 'object' ? {
      archetype: sanitizeText(result.archetype || '' , 200),
      hollandCode: sanitizeText(result.hollandCode || '' , 20),
      description: sanitizeText(result.description || '' , 2000),
      suitabilityScore: Number(result.suitabilityScore || 0),
      insights: sanitizeText(result.insights || '' , 2000),
      riasecScores: result.riasecScores && typeof result.riasecScores === 'object'
        ? result.riasecScores
        : {},
      scoreBreakdown: result.scoreBreakdown && typeof result.scoreBreakdown === 'object'
        ? result.scoreBreakdown
        : {},
      confidence: result.confidence && typeof result.confidence === 'object'
        ? result.confidence
        : {},
      method: sanitizeText(result.method || '', 100),
      surveyThreshold: Number(result.surveyThreshold || 0),
      careers: Array.isArray(result.careers) ? result.careers.map(sanitizeCareer).filter(Boolean).slice(0,12) : [],
    } : {};

    const autoTitle =
      (title && String(title).trim()) ||
      (safeResult?.archetype
        ? `${safeResult.archetype} — ${new Date().toLocaleDateString("vi-VN")}`
        : `Trắc nghiệm ${new Date().toLocaleDateString("vi-VN")}`);

    const record = await SurveyHistory.create({
      userId:      req.user._id,
      title:       autoTitle,
      answers:     answers || {},
      result:      safeResult,
      completedAt: new Date(),
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    console.error("saveSurveyResult Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all survey history for current user (summary)
// @route GET /api/survey-history
// @access Private
const getSurveyHistory = async (req, res) => {
  try {
    const records = await SurveyHistory.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .select("title result.archetype result.hollandCode result.suitabilityScore result.description result.insights result.riasecScores result.scoreBreakdown result.confidence result.method result.careers completedAt");

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get one survey history record (full detail)
// @route GET /api/survey-history/:id
// @access Private
const getSurveyHistoryById = async (req, res) => {
  try {
    const record = await SurveyHistory.findOne({
      _id:    req.params.id,
      userId: req.user._id,
    });
    if (!record) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Rename a survey history record
// @route PATCH /api/survey-history/:id/rename
// @access Private
const renameSurveyHistory = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title required" });

    const record = await SurveyHistory.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { title: title.trim() } },
      { new: true }
    );
    if (!record) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete a survey history record
// @route DELETE /api/survey-history/:id
// @access Private
const deleteSurveyHistory = async (req, res) => {
  try {
    await SurveyHistory.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  saveSurveyResult,
  getSurveyHistory,
  getSurveyHistoryById,
  renameSurveyHistory,
  deleteSurveyHistory,
};
