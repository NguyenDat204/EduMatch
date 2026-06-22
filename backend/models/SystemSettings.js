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
      default: "gemini-2.5-flash",
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
      default: "",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemSettings", SystemSettingsSchema);
