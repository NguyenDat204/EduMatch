const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const seedDatabase = require("./config/seed");
const jwt = require("jsonwebtoken");
const { getSystemSettings } = require("./services/systemSettingsService");

// Route imports
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const careerRoutes = require("./routes/careerRoutes");
const universityRoutes = require("./routes/universityRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const articleRoutes = require("./routes/articleRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const skillGapRoutes = require("./routes/skillGapRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const surveyHistoryRoutes = require("./routes/surveyHistoryRoutes");
const surveyQuestionRoutes = require("./routes/surveyQuestionRoutes");
const recommendationFeedbackRoutes = require("./routes/recommendationFeedbackRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const planRoutes = require("./routes/planRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

// Connect to Database
connectDB().then(() => {
  // Seed database with initial data
  seedDatabase();
});

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors());

// Limit request body size to prevent large payloads
app.use(express.json({ limit: '100kb' }));

// Enforce presence of JWT_SECRET in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET must be set in production');
  process.exit(1);
}

// Rate limiters for sensitive endpoints
const recommendationsLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false }); // 10 requests/min
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 6, standardHeaders: true, legacyHeaders: false }); // 6 requests/min

const maintenanceGuard = async (req, res, next) => {
  try {
    if (
      req.method === "OPTIONS" ||
      req.path === "/" ||
      req.path.startsWith("/api/settings/public") ||
      req.path.startsWith("/api/auth/login") ||
      req.path.startsWith("/api/admin")
    ) {
      return next();
    }

    const settings = await getSystemSettings();
    if (!settings.maintenanceMode) return next();

    let isAdmin = false;
    const authHeader = req.headers.authorization || "";
    if (authHeader.startsWith("Bearer ") && process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
        const User = require("./models/User");
        const user = await User.findById(decoded.id).select("role").lean();
        isAdmin = user?.role === "admin";
      } catch {
        isAdmin = false;
      }
    }

    if (isAdmin) return next();
    return res.status(503).json({
      success: false,
      message: "Hệ thống đang bảo trì. Vui lòng quay lại sau.",
    });
  } catch (error) {
    next(error);
  }
};

app.use(maintenanceGuard);

// Register API Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/universities", universityRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
// Apply rate limiter to AI recommendation route (legacy POST) to reduce abuse
app.use("/api/recommendations", (req, res, next) => {
  if (req.method === 'POST' && req.path === '/') return recommendationsLimiter(req, res, next);
  return next();
}, recommendationRoutes);
app.use("/api/analytics/skill-gap", skillGapRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api", planRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/survey-questions", surveyQuestionRoutes);
app.use("/api/survey-history", surveyHistoryRoutes);
app.use("/api/recommendation-feedback", recommendationFeedbackRoutes);

app.get("/", (req, res) => {
  res.send("EduMatch AI API Server is running beautifully...");
});

// Centralized Error handler middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "An unexpected server error occurred",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`EduMatch API server is listening on port ${PORT}`);
});
