const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
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

// Connect to Database
connectDB().then(() => {
  // Seed Database with initial mock data
  seedDatabase();
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/universities", universityRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/analytics/skill-gap", skillGapRoutes);
app.use("/api/subscription", subscriptionRoutes);

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
