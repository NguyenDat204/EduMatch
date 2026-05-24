const express = require("express");
const router  = express.Router();
const {
  getChatAdvisorResponse,
  getChatHistory,
  clearChatHistory,
  getConversations,
  getConversationById,
  renameConversation,
  deleteConversation,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

// Active conversation (most recent non-archived)
router.get(   "/history",                protect, getChatHistory);
router.delete("/history",                protect, clearChatHistory);

// Send message
router.post(  "/",                       protect, getChatAdvisorResponse);

// All conversations list
router.get(   "/conversations",          protect, getConversations);
router.get(   "/conversations/:id",      protect, getConversationById);
router.patch( "/conversations/:id/rename", protect, renameConversation);
router.delete("/conversations/:id",      protect, deleteConversation);

module.exports = router;
