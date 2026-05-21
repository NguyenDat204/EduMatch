const jwt = require("jsonwebtoken");
const User = require("../models/User");
const University = require("../models/University");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "edumatchsecret123", {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, school } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Determine role (first user becomes admin for testing simplicity, or default to provided role / student)
    const count = await User.countDocuments();
    let finalRole = req.body.role || "student";
    if (count === 0) {
      finalRole = "admin";
    }

    const user = await User.create({
      name,
      email,
      password,
      role: finalRole,
      academicInfo: {
        school: school || "",
        grade: "12",
        majorInterest: "",
      },
    });

    if (user) {
      if (finalRole === "university") {
        const universityName = school || "Đại học FPT (FPT University)";
        let uni = await University.findOne({ name: { $regex: new RegExp("^" + universityName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") } });
        if (!uni) {
          uni = await University.create({
            name: universityName,
            location: "Hà Nội, Việt Nam",
            representativeId: user._id
          });
        } else {
          uni.representativeId = user._id;
          await uni.save();
        }
        user.universityId = uni._id;
        await user.save();
      }

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isPro: user.isPro,
          academicInfo: user.academicInfo,
          universityId: user.universityId,
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isPro: user.isPro,
          academicInfo: user.academicInfo,
          universityId: user.universityId,
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
};

// @desc    Auth user via Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { email, name, avatar } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Google email is required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create user if not exists
      const secureRandomPassword = Math.random().toString(36).slice(-10);
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        password: secureRandomPassword,
        role: "student",
        avatar: avatar || `https://i.pravatar.cc/150?u=${email}`,
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isPro: user.isPro,
        academicInfo: user.academicInfo,
        universityId: user.universityId,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ message: "Server error during Google auth", error: error.message });
  }
};

// @desc    Forgot Password request (Generates OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản với email này" });
    }

    // Generate a secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to user with 10 minutes expiration
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    console.log(`\n==============================================`);
    console.log(`[OTP RECOVERY] EMAIL: ${email}`);
    console.log(`[OTP RECOVERY] CODE:  ${otp}`);
    console.log(`==============================================\n`);

    res.json({
      success: true,
      message: `Mã OTP đã được gửi! Đối với môi trường thử nghiệm, mã của bạn là: ${otp}`,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Lỗi máy chủ trong quá trình khôi phục mật khẩu", error: error.message });
  }
};

// @desc    Reset Password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ các thông tin yêu cầu" });
    }

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Mã OTP không chính xác hoặc đã hết hạn" });
    }

    // Update password and clear OTP fields
    user.password = newPassword; // Will be cryptographically hashed via the pre-save hook in User.js
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    
    await user.save();

    res.json({
      success: true,
      message: "Mật khẩu của bạn đã được thay đổi thành công! Vui lòng đăng nhập lại.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Lỗi máy chủ trong quá trình đặt lại mật khẩu", error: error.message });
  }
};

module.exports = {
  registerUser,
  authUser,
  googleLogin,
  forgotPassword,
  resetPassword,
};
