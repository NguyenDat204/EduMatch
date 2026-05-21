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

// @desc    Increment university views (15s delay trigger)
// @route   POST /api/universities/:id/view
// @access  Private
const incrementViews = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) {
      return res.status(404).json({ message: "Không tìm thấy thông tin trường học" });
    }

    university.views = (university.views || 0) + 1;

    // Log the user's action
    if (req.user) {
      university.viewLogs.push({
        userId: req.user._id,
        userName: req.user.name,
        userSchool: req.user.academicInfo?.school || "Không rõ trường THPT",
        timestamp: new Date()
      });
      console.log(`[UNI VIEWS] University "${university.name}" viewed by student "${req.user.name}"`);
    } else {
      console.log(`[UNI VIEWS] University "${university.name}" viewed by anonymous student`);
    }

    await university.save();
    res.json({ success: true, views: university.views, data: university });
  } catch (error) {
    console.error("Increment Views Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get representative's managed university
// @route   GET /api/universities/managed/my-university
// @access  Private
const getMyUniversity = async (req, res) => {
  try {
    let university = null;
    if (req.user.universityId) {
      university = await University.findById(req.user.universityId);
    }
    if (!university) {
      university = await University.findOne({ representativeId: req.user._id });
    }
    
    // Fallback: If not found, look for one that has no representative or assign the first seeded university
    if (!university) {
      const schoolName = req.user.academicInfo?.school || "Đại học FPT (FPT University)";
      university = await University.findOne({ name: { $regex: new RegExp("^" + schoolName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") } });
      if (!university) {
        university = await University.create({
          name: schoolName,
          location: "Hà Nội, Việt Nam",
          representativeId: req.user._id
        });
      } else {
        university.representativeId = req.user._id;
        await university.save();
      }
      
      req.user.universityId = university._id;
      await req.user.save();
    }

    res.json({ success: true, data: university });
  } catch (error) {
    console.error("Get My University Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update representative's managed university
// @route   PUT /api/universities/managed/my-university
// @access  Private
const updateMyUniversity = async (req, res) => {
  try {
    let university = null;
    if (req.user.universityId) {
      university = await University.findById(req.user.universityId);
    }
    if (!university) {
      university = await University.findOne({ representativeId: req.user._id });
    }

    if (!university) {
      return res.status(404).json({ message: "Không tìm thấy thông tin trường học cần quản lý" });
    }

    // Allow updating location, tuitionFee, scholarships, admissions, ranking, programs, website
    if (req.body.location !== undefined) university.location = req.body.location;
    if (req.body.tuitionFee !== undefined) university.tuitionFee = req.body.tuitionFee;
    if (req.body.scholarships !== undefined) university.scholarships = req.body.scholarships;
    if (req.body.admissions !== undefined) university.admissions = req.body.admissions;
    if (req.body.ranking !== undefined) university.ranking = req.body.ranking;
    if (req.body.website !== undefined) university.website = req.body.website;
    if (req.body.programs !== undefined) {
      university.programs = Array.isArray(req.body.programs) ? req.body.programs : req.body.programs.split(",").map(p => p.trim());
    }

    const updatedUniversity = await university.save();
    res.json({ success: true, data: updatedUniversity });
  } catch (error) {
    console.error("Update My University Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getUniversities,
  getUniversity,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  incrementViews,
  getMyUniversity,
  updateMyUniversity,
};
