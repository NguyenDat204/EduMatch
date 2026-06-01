const SurveyQuestion = require("../models/SurveyQuestion");

// @desc  Get survey question bank for the frontend
// @route GET /api/survey-questions
// @access Public
const getSurveyQuestions = async (req, res) => {
  try {
    const questions = await SurveyQuestion.find({}, { _id: 0, __v: 0 }).sort({ order: 1 });
    const payload = questions.map((question) => ({
      id: question.questionId,
      text: question.text,
      type: question.type,
      options: question.options,
      category: question.category,
    }));

    res.json({ success: true, data: payload });
  } catch (error) {
    console.error("getSurveyQuestions Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSurveyQuestions,
};
