const Career = require("../models/Career");
const User = require("../models/User");

// @desc    Get all careers with search and category filtering
// @route   GET /api/careers
// @access  Public
const getCareers = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (category && category !== "Tất cả") {
      query.category = category;
    }

    const careers = await Career.find(query);
    res.json({ success: true, data: careers });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get a career by ID
// @route   GET /api/careers/:id
// @access  Public
const getCareer = async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    if (!career) {
      // If MongoDB ID is not standard or not found, try searching by custom numeric ID or slug for seed compatibility
      const fallBackCareer = await Career.findOne({ title: { $regex: req.params.id.replace(/-/g, " "), $options: "i" } });
      if (fallBackCareer) {
        return res.json({ success: true, data: fallBackCareer });
      }
      return res.status(404).json({ message: "Career not found" });
    }
    res.json({ success: true, data: career });
  } catch (error) {
    // Check if cast error (invalid ObjectId)
    if (error.name === "CastError") {
      const fallBackCareer = await Career.findOne({ title: { $regex: req.params.id.replace(/-/g, " "), $options: "i" } });
      if (fallBackCareer) {
        return res.json({ success: true, data: fallBackCareer });
      }
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create a career (Admin)
// @route   POST /api/careers
// @access  Private/Admin
const createCareer = async (req, res) => {
  try {
    const { title, description, salary, growth, skills, category, roadmap } = req.body;

    const careerExists = await Career.findOne({ title });
    if (careerExists) {
      return res.status(400).json({ message: "Career with this title already exists" });
    }

    const career = await Career.create({
      title,
      description,
      salary,
      growth,
      skills: Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim()),
      category,
      roadmap: roadmap || []
    });

    res.status(201).json({ success: true, data: career });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a career (Admin)
// @route   PUT /api/careers/:id
// @access  Private/Admin
const updateCareer = async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);

    if (career) {
      career.title = req.body.title || career.title;
      career.description = req.body.description || career.description;
      career.salary = req.body.salary || career.salary;
      career.growth = req.body.growth || career.growth;
      if (req.body.skills) {
        career.skills = Array.isArray(req.body.skills) ? req.body.skills : req.body.skills.split(",").map(s => s.trim());
      }
      career.category = req.body.category || career.category;
      if (req.body.roadmap) career.roadmap = req.body.roadmap;

      const updatedCareer = await career.save();
      res.json({ success: true, data: updatedCareer });
    } else {
      res.status(404).json({ message: "Career not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a career (Admin)
// @route   DELETE /api/careers/:id
// @access  Private/Admin
const deleteCareer = async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    if (!career) {
      return res.status(404).json({ message: "Career not found" });
    }
    await career.deleteOne();
    res.json({ success: true, message: "Career removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Toggle favorite status of a career for current student
// @route   POST /api/careers/:id/favorite
// @access  Private
const toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const careerId = req.params.id;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.favorites.indexOf(careerId);
    let isFavorite = false;
    
    if (index > -1) {
      // Remove from favorites
      user.favorites.splice(index, 1);
    } else {
      // Add to favorites
      user.favorites.push(careerId);
      isFavorite = true;
    }

    await user.save();
    res.json({ success: true, isFavorite, data: user.favorites });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user's favorite careers list
// @route   GET /api/careers/favorites/list
// @access  Private
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Find careers that have IDs inside user's favorites array
    // Since IDs can be standard Mongo ObjectIds or titles/slugs, we check both
    const careers = await Career.find({
      $or: [
        { _id: { $in: user.favorites.filter(id => id.match(/^[0-9a-fA-F]{24}$/)) } },
        { title: { $in: user.favorites } }
      ]
    });

    res.json({ success: true, data: careers });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getCareers,
  getCareer,
  createCareer,
  updateCareer,
  deleteCareer,
  toggleFavorite,
  getFavorites,
};
