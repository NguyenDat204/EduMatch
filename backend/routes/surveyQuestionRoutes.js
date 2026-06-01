const express = require("express");
const { getSurveyQuestions } = require("../controllers/surveyQuestionController");

const router = express.Router();
router.get("/", getSurveyQuestions);

module.exports = router;
