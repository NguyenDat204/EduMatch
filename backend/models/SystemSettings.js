const mongoose = require("mongoose");

const SystemSettingsSchema = new mongoose.Schema(
  {
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowRegistration: {
      type: Boolean,
      default: true,
    },
    appTitle: {
      type: String,
      default: "EduMatch",
      trim: true,
    },
    aiModel: {
      type: String,
      default: "gemini-1.5-flash",
      trim: true,
    },
    maxChatHistory: {
      type: Number,
      default: 50,
    },
    surveyThreshold: {
      type: Number,
      default: 70,
    },
    systemPromptTemplate: {
      type: String,
      default: "Bạn là một trợ lý AI hướng nghiệp thông minh và tận tâm của EduMatch. Nhiệm vụ của bạn là hỗ trợ học sinh khám phá bản thân, định hướng ngành nghề dựa trên kết quả trắc nghiệm và thông tin học tập của các em. Hãy trả lời ngắn gọn, súc tích, động viên và đưa ra những lời khuyên hữu ích, mang tính giáo dục cao.",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemSettings", SystemSettingsSchema);
