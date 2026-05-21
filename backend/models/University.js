const mongoose = require("mongoose");

const UniversitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    ranking: {
      type: String,
      default: "Unranked",
    },
    logo: {
      type: String,
      default: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Globe_and_books_icon.svg",
    },
    programs: {
      type: [String],
      default: [],
    },
    website: {
      type: String,
      default: "",
    },
    tuitionFee: {
      type: Number,
      default: 20000000,
    },
    scholarships: {
      type: String,
      default: "Học bổng lên tới 50% - 100% dành cho học sinh có thành tích học tập xuất sắc.",
    },
    admissions: {
      type: String,
      default: "Xét tuyển thẳng, dựa trên học bạ hoặc điểm thi THPT Quốc gia.",
    },
    views: {
      type: Number,
      default: 0,
    },
    representativeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    viewLogs: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        userName: String,
        userSchool: String,
        timestamp: {
          type: Date,
          default: Date.now,
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("University", UniversitySchema);
