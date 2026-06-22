const SystemSettings = require("../models/SystemSettings");

const DEFAULT_SETTINGS = {
  maintenanceMode: false,
  allowRegistration: true,
  appTitle: "EduMatch",
  aiModel: "gemini-2.5-flash",
  maxChatHistory: 50,
  surveyThreshold: 70,
  systemPromptTemplate: "",
};

const ALLOWED_AI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

let cache = {
  value: null,
  timestamp: 0,
};

const CACHE_TTL_MS = 30 * 1000;

const clampNumber = (value, min, max, fallback) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, Math.round(numeric)));
};

const toBoolean = (value, fallback) => {
  if (typeof value === "boolean") return value;
  return fallback;
};

const cleanText = (value, fallback = "", maxLength = 1000) => {
  if (typeof value !== "string") return fallback;
  return value.trim().slice(0, maxLength);
};

const normalizeSettings = (settings = {}) => ({
  ...DEFAULT_SETTINGS,
  ...settings,
  maintenanceMode: toBoolean(settings.maintenanceMode, DEFAULT_SETTINGS.maintenanceMode),
  allowRegistration: toBoolean(settings.allowRegistration, DEFAULT_SETTINGS.allowRegistration),
  appTitle: cleanText(settings.appTitle, DEFAULT_SETTINGS.appTitle, 60) || DEFAULT_SETTINGS.appTitle,
  aiModel: ALLOWED_AI_MODELS.includes(settings.aiModel) ? settings.aiModel : DEFAULT_SETTINGS.aiModel,
  maxChatHistory: clampNumber(settings.maxChatHistory, 5, 200, DEFAULT_SETTINGS.maxChatHistory),
  surveyThreshold: clampNumber(settings.surveyThreshold, 10, 100, DEFAULT_SETTINGS.surveyThreshold),
  systemPromptTemplate: cleanText(settings.systemPromptTemplate, DEFAULT_SETTINGS.systemPromptTemplate, 4000),
});

const validateSettingsPayload = (payload = {}) => {
  const errors = [];
  const sanitized = normalizeSettings(payload);

  if (payload.appTitle !== undefined && !sanitized.appTitle) {
    errors.push("Tiêu đề ứng dụng không được để trống.");
  }

  if (payload.aiModel !== undefined && !ALLOWED_AI_MODELS.includes(payload.aiModel)) {
    errors.push("Mô hình AI không hợp lệ.");
  }

  if (payload.maxChatHistory !== undefined) {
    const value = Number(payload.maxChatHistory);
    if (!Number.isFinite(value) || value < 5 || value > 200) {
      errors.push("Số tin nhắn đưa vào ngữ cảnh AI phải nằm trong khoảng 5-200.");
    }
  }

  if (payload.surveyThreshold !== undefined) {
    const value = Number(payload.surveyThreshold);
    if (!Number.isFinite(value) || value < 10 || value > 100) {
      errors.push("Ngưỡng điểm gợi ý ngành phải nằm trong khoảng 10-100%.");
    }
  }

  if (payload.systemPromptTemplate !== undefined && String(payload.systemPromptTemplate).length > 4000) {
    errors.push("System prompt không được vượt quá 4000 ký tự.");
  }

  return { sanitized, errors };
};

const getSystemSettings = async ({ force = false } = {}) => {
  if (!force && cache.value && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return cache.value;
  }

  let settings = await SystemSettings.findOne().lean();
  if (!settings) {
    settings = (await SystemSettings.create(DEFAULT_SETTINGS)).toObject();
  }

  cache = {
    value: normalizeSettings(settings),
    timestamp: Date.now(),
  };

  return cache.value;
};

const invalidateSystemSettingsCache = () => {
  cache = { value: null, timestamp: 0 };
};

module.exports = {
  DEFAULT_SETTINGS,
  ALLOWED_AI_MODELS,
  getSystemSettings,
  invalidateSystemSettingsCache,
  normalizeSettings,
  validateSettingsPayload,
};
