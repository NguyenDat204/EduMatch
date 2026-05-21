const User = require("../models/User");

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.avatar = req.body.avatar || user.avatar;
      
      if (req.body.academicInfo) {
        user.academicInfo.school = req.body.academicInfo.school !== undefined ? req.body.academicInfo.school : user.academicInfo.school;
        user.academicInfo.grade = req.body.academicInfo.grade !== undefined ? req.body.academicInfo.grade : user.academicInfo.grade;
        user.academicInfo.majorInterest = req.body.academicInfo.majorInterest !== undefined ? req.body.academicInfo.majorInterest : user.academicInfo.majorInterest;
      }

      const updatedUser = await user.save();
      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
          isPro: updatedUser.isPro,
          academicInfo: updatedUser.academicInfo,
          favorites: updatedUser.favorites,
          personalityTest: updatedUser.personalityTest,
          skillEvaluation: updatedUser.skillEvaluation,
          universityId: updatedUser.universityId
        },
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update academic profile (grades)
// @route   PUT /api/profile/academic
// @access  Private
const updateAcademicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (req.body.school) user.academicInfo.school = req.body.school;
      if (req.body.grade) user.academicInfo.grade = req.body.grade;
      if (req.body.majorInterest) user.academicInfo.majorInterest = req.body.majorInterest;
      
      if (req.body.subjects) {
        user.academicInfo.subjects = {
          ...user.academicInfo.subjects.toObject(),
          ...req.body.subjects,
        };
      }

      await user.save();
      res.json({ success: true, data: user.academicInfo });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update skill evaluation scores
// @route   PUT /api/profile/skills
// @access  Private
const updateSkillEvaluation = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.skillEvaluation = {
        scores: {
          ...user.skillEvaluation.scores.toObject(),
          ...req.body.scores,
        },
        updatedAt: new Date()
      };

      await user.save();
      res.json({ success: true, data: user.skillEvaluation });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Upgrade user account to Pro (Simulated sandbox payment validation)
// @route   POST /api/profile/upgrade
// @access  Private
const upgradeToPro = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    user.isPro = true;
    user.subscription = {
      plan: "pro",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days active limit
      status: "active"
    };

    const updatedUser = await user.save();
    console.log(`[PRO UPGRADE] User "${user.name}" upgraded to PRO successfully!`);

    res.json({
      success: true,
      message: "Tài khoản của bạn đã được nâng cấp lên gói PRO thành công!",
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        isPro: updatedUser.isPro,
        subscription: updatedUser.subscription,
        academicInfo: updatedUser.academicInfo,
        universityId: updatedUser.universityId
      }
    });
  } catch (error) {
    console.error("Upgrade to Pro Error:", error);
    res.status(500).json({ message: "Lỗi máy chủ trong quá trình nâng cấp", error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateAcademicProfile,
  updateSkillEvaluation,
  upgradeToPro,
};
