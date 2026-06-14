const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const seedDatabase = require("./config/seed");

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
app.use("/api/survey-questions", surveyQuestionRoutes);
app.use("/api/survey-history", surveyHistoryRoutes);

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
