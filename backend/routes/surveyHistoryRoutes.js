const express = require("express");
const router  = express.Router();
const {
  saveSurveyResult,
  getSurveyHistory,
  getSurveyHistoryById,
  renameSurveyHistory,
  deleteSurveyHistory,
} = require("../controllers/surveyHistoryController");
const { protect } = require("../middleware/authMiddleware");

router.post(  "/",           protect, saveSurveyResult);
router.get(   "/",           protect, getSurveyHistory);
router.get(   "/:id",        protect, getSurveyHistoryById);
router.patch( "/:id/rename", protect, renameSurveyHistory);
router.delete("/:id",        protect, deleteSurveyHistory);

module.exports = router;
