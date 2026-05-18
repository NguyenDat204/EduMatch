const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      default: "EduMatch AI Guide",
    },
    readTime: {
      type: String,
      default: "5 phút đọc",
    },
    category: {
      type: String,
      default: "Hướng nghiệp",
      trim: true,
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", ArticleSchema);
