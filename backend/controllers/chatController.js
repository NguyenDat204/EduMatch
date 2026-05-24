const aiService = require("../services/aiService");
const User = require("../models/User");
const ChatHistory = require("../models/ChatHistory");

// @desc    Load persisted chat history for current user
// @route   GET /api/chat/history
// @access  Private
const getChatHistory = async (req, res) => {
  try {
    const record = await ChatHistory.findOne({
      userId: req.user._id,
      isArchived: false,
    }).sort({ lastMessageTime: -1 });

    if (!record) {
      return res.json({ success: true, data: [] });
    }

    // Map stored role "assistant" → "ai" for frontend compatibility
    const messages = record.messages.map((m) => ({
      role: m.role === "assistant" ? "ai" : m.role,
      content: m.content,
      timestamp: m.timestamp,
    }));

    res.json({ success: true, data: messages, conversationId: record.conversationId });
  } catch (error) {
    console.error("getChatHistory Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get AI Advisor Chat response + auto-save to DB
// @route   POST /api/chat
// @access  Private
const getChatAdvisorResponse = async (req, res) => {
  try {
    const { chatHistory, conversationId } = req.body;

    if (!chatHistory || !Array.isArray(chatHistory) || chatHistory.length === 0) {
      return res.status(400).json({ message: "Chat history is required" });
    }

    // Load full user profile for personalized context
    const user = await User.findById(req.user._id).select("-password");

    const aiResponse = await aiService.getChatResponse(chatHistory, user);

    // ── Persist conversation ──────────────────────────────────────
    const convId = conversationId || `conv_${req.user._id}_${Date.now()}`;

    // Map frontend "ai" role → "assistant" for storage
    const storableMessages = chatHistory.map((m) => ({
      role: m.role === "ai" ? "assistant" : m.role,
      content: m.content,
      timestamp: m.timestamp || new Date(),
    }));

    // Append the new AI reply
    storableMessages.push({
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    });

    await ChatHistory.findOneAndUpdate(
      { conversationId: convId },
      {
        $set: {
          userId: req.user._id,
          conversationId: convId,
          messages: storableMessages,
          lastMessageTime: new Date(),
          isArchived: false,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
    // ─────────────────────────────────────────────────────────────

    res.json({
      success: true,
      data: { role: "ai", content: aiResponse },
      conversationId: convId,
    });
  } catch (error) {
    console.error("Chat Controller Error:", error);
    res.status(500).json({ message: "Advisor connection issue", error: error.message });
  }
};

// @desc    List all conversations for current user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const records = await ChatHistory.find({ userId: req.user._id })
      .sort({ lastMessageTime: -1 })
      .select("conversationId title lastMessageTime messages isArchived");

    const list = records.map((r) => ({
      conversationId: r.conversationId,
      title:          r.title || `Cuộc trò chuyện ${new Date(r.lastMessageTime).toLocaleDateString("vi-VN")}`,
      lastMessageTime: r.lastMessageTime,
      isArchived:     r.isArchived,
      preview:        r.messages?.[r.messages.length - 1]?.content?.slice(0, 80) || "",
      messageCount:   r.messages?.length || 0,
    }));

    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Load a specific conversation by ID
// @route   GET /api/chat/conversations/:id
// @access  Private
const getConversationById = async (req, res) => {
  try {
    const record = await ChatHistory.findOne({
      conversationId: req.params.id,
      userId: req.user._id,
    });

    if (!record) return res.status(404).json({ success: false, message: "Not found" });

    const messages = record.messages.map((m) => ({
      role:      m.role === "assistant" ? "ai" : m.role,
      content:   m.content,
      timestamp: m.timestamp,
    }));

    res.json({
      success: true,
      data: messages,
      conversationId: record.conversationId,
      title: record.title || "",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Rename a conversation
// @route   PATCH /api/chat/conversations/:id/rename
// @access  Private
const renameConversation = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title required" });

    const record = await ChatHistory.findOneAndUpdate(
      { conversationId: req.params.id, userId: req.user._id },
      { $set: { title: title.trim() } },
      { returnDocument: 'after' }
    );

    if (!record) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: { title: record.title } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Archive (soft-delete) a specific conversation
// @route   DELETE /api/chat/conversations/:id
// @access  Private
const deleteConversation = async (req, res) => {
  try {
    await ChatHistory.findOneAndUpdate(
      { conversationId: req.params.id, userId: req.user._id },
      { $set: { isArchived: true } }
    );
    res.json({ success: true, message: "Archived" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear all conversations for current user
// @route   DELETE /api/chat/conversations
// @access  Private
const clearChatHistory = async (req, res) => {
  try {
    await ChatHistory.updateMany(
      { userId: req.user._id, isArchived: false },
      { $set: { isArchived: true } }
    );
    res.json({ success: true, message: "Conversation cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getChatAdvisorResponse, getChatHistory, getConversations, getConversationById, renameConversation, deleteConversation, clearChatHistory };
