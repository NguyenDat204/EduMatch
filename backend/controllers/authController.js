const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const User = require("../models/User");
const University = require("../models/University");
const { getSystemSettings } = require("../services/systemSettingsService");

const AUTH_USER_FIELDS = "name email role avatar isPro subscription academicInfo favorites personalityTest skillEvaluation universityId password";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const buildAuthUserPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  isPro: user.isPro,
  subscription: user.subscription,
  academicInfo: user.academicInfo,
  favorites: user.favorites,
  personalityTest: user.personalityTest,
  skillEvaluation: user.skillEvaluation,
  universityId: user.universityId,
});

const sendAuthResponse = (res, user, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data: buildAuthUserPayload(user),
    token: generateToken(user._id),
  });
};

const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.warn('Warning: JWT_SECRET is not set. Tokens may be insecure.');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const settings = await getSystemSettings();
    const { name, password, school, grade = '12', majorInterest = '' } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const count = await User.countDocuments();
    if (!settings.allowRegistration && count > 0) {
      return res.status(403).json({ message: "Đăng ký tài khoản mới đang tạm đóng." });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Determine role (first user becomes admin for testing simplicity, or default to provided role / student)
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
        grade: grade || "12",
        majorInterest: majorInterest || "",
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

      sendAuthResponse(res, user, 201);
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
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select(AUTH_USER_FIELDS);

    if (user && (await user.matchPassword(password))) {
      sendAuthResponse(res, user);
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
    const { token, email: requestEmail, name: requestName, avatar: requestAvatar } = req.body;

    let email = normalizeEmail(requestEmail);
    let name = requestName;
    let avatar = requestAvatar;

    if (token) {
      if (!googleClient) {
        return res.status(500).json({ message: "Google login is not configured on the server." });
      }

      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      if (!payload || !payload.email || payload.email_verified !== true) {
        return res.status(401).json({ message: "Invalid Google token or unverified email." });
      }

      email = normalizeEmail(payload.email);
      name = payload.name || email.split("@")[0];
      avatar = payload.picture || avatar;
    }

    if (!email) {
      return res.status(400).json({ message: "Google email is required" });
    }

    let user = await User.findOne({ email }).select(AUTH_USER_FIELDS);

    if (!user) {
      const settings = await getSystemSettings();
      const count = await User.countDocuments();
      if (!settings.allowRegistration && count > 0) {
        return res.status(403).json({ message: "Đăng ký tài khoản mới đang tạm đóng." });
      }
      const secureRandomPassword = Math.random().toString(36).slice(-10);
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        password: secureRandomPassword,
        role: "student",
        avatar: avatar || `https://i.pravatar.cc/150?u=${email}`,
      });
    }

    sendAuthResponse(res, user);
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ message: "Server error during Google auth", error: error.message });
  }
};

// @desc    Forgot Password request (checks email only)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản với email này" });
    }

    res.json({
      success: true,
      message: "Email hợp lệ. Bạn có thể đặt mật khẩu mới.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Lỗi máy chủ trong quá trình khôi phục mật khẩu", error: error.message });
  }
};

// @desc    Reset Password by existing email
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ các thông tin yêu cầu" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản với email này" });
    }

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

// @desc    Change Password (authenticated)
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Google OAuth users may have a random password — allow setting a real one
    const isValidCurrentPassword = await user.matchPassword(currentPassword);
    if (!isValidCurrentPassword) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.json({ success: true, message: "Mật khẩu đã được thay đổi thành công!" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

module.exports = {
  registerUser,
  authUser,
  googleLogin,
  forgotPassword,
  resetPassword,
  changePassword,
};
