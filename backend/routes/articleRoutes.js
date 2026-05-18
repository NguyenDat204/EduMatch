const express = require("express");
const router = express.Router();
const { getArticles, getArticle, createArticle } = require("../controllers/articleController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", getArticles);
router.get("/:id", getArticle);
router.post("/", protect, admin, createArticle);

module.exports = router;
