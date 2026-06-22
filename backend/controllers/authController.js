const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require("nodemailer");
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

// ==================== EMAIL SERVICE ====================
const createTransporter = () => {
  // Support Gmail (default) or any SMTP config from env
  if (process.env.EMAIL_SERVICE === 'gmail' || !process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendOTPEmail = async (toEmail, otp, userName = '') => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[EMAIL] EMAIL_USER or EMAIL_PASS not configured. OTP will only be logged.');
    return false;
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"EduMatch 🎓" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: '[EduMatch] Mã xác thực khôi phục mật khẩu',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
            .container { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 36px 32px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
            .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
            .body { padding: 40px 32px; }
            .greeting { color: #1e293b; font-size: 16px; font-weight: 600; margin-bottom: 16px; }
            .text { color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
            .otp-box { background: #f1f5f9; border: 2px dashed #6366f1; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
            .otp-code { font-size: 40px; font-weight: 900; color: #6366f1; letter-spacing: 8px; font-family: monospace; }
            .otp-label { color: #94a3b8; font-size: 12px; margin-top: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; color: #92400e; font-size: 13px; margin: 20px 0; }
            .footer { background: #f8fafc; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 EduMatch</h1>
              <p>Nền tảng định hướng nghề nghiệp AI</p>
            </div>
            <div class="body">
              <p class="greeting">Xin chào${userName ? ` ${userName}` : ''}!</p>
              <p class="text">Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản EduMatch. Vui lòng sử dụng mã OTP dưới đây để đặt lại mật khẩu:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <div class="otp-label">Mã xác thực (OTP)</div>
              </div>
              <div class="warning">
                ⚠️ Mã OTP này <strong>sẽ hết hạn sau 10 phút</strong>. Không chia sẻ mã này với bất kỳ ai.
              </div>
              <p class="text">Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} EduMatch · Tất cả quyền được bảo lưu</p>
              <p style="margin-top:4px">Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`[EMAIL] OTP sent successfully to ${toEmail}`);
    return true;
  } catch (err) {
    console.error('[EMAIL] Failed to send OTP email:', err.message);
    return false;
  }
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

    // Attempt to send email — fall back gracefully if email not configured
    const emailSent = await sendOTPEmail(email, otp, user.name);

    const message = emailSent
      ? 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (bao gồm thư mục Spam).'
      : `Mã OTP của bạn là: ${otp} (Email chưa được cấu hình trên server)`;

    res.json({
      success: true,
      message,
      // In dev/test mode expose OTP; in production rely solely on email
      ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
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
