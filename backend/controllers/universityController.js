const University = require("../models/University");

// @desc    Get all universities with filters
// @route   GET /api/universities
// @access  Public
const getUniversities = async (req, res) => {
  try {
    const { search, location } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (location && location !== "Tất cả") {
      query.location = { $regex: location, $options: "i" };
    }

    const universities = await University.find(query);
    res.json({ success: true, data: universities });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get university by ID
// @route   GET /api/universities/:id
// @access  Public
const getUniversity = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }
    res.json({ success: true, data: university });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create new university (Admin)
// @route   POST /api/universities
// @access  Private/Admin
const createUniversity = async (req, res) => {
  try {
    const { name, location, ranking, logo, programs, website } = req.body;

    const uniExists = await University.findOne({ name });
    if (uniExists) {
      return res.status(400).json({ message: "University with this name already exists" });
    }

    const university = await University.create({
      name,
      location,
      ranking,
      logo,
      programs: Array.isArray(programs) ? programs : programs.split(",").map(p => p.trim()),
      website
    });

    res.status(201).json({ success: true, data: university });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a university (Admin)
// @route   PUT /api/universities/:id
// @access  Private/Admin
const updateUniversity = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);

    if (university) {
      university.name = req.body.name || university.name;
      university.location = req.body.location || university.location;
      university.ranking = req.body.ranking || university.ranking;
      university.logo = req.body.logo || university.logo;
      if (req.body.programs) {
        university.programs = Array.isArray(req.body.programs) ? req.body.programs : req.body.programs.split(",").map(p => p.trim());
      }
      university.website = req.body.website || university.website;

      const updatedUniversity = await university.save();
      res.json({ success: true, data: updatedUniversity });
    } else {
      res.status(404).json({ message: "University not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a university (Admin)
// @route   DELETE /api/universities/:id
// @access  Private/Admin
const deleteUniversity = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }
    await university.deleteOne();
    res.json({ success: true, message: "University removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getUniversities,
  getUniversity,
  createUniversity,
  updateUniversity,
  deleteUniversity,
};
