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
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("University", UniversitySchema);
