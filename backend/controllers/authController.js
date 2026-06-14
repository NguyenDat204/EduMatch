const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require("nodemailer");
const User = require("../models/User");
const University = require("../models/University");

// ==================== EMAIL SERVICE ====================
const createTransporter = () => {
  // Gmail with App Password — use direct SMTP (port 465 SSL) for reliability
  if (process.env.EMAIL_SERVICE === 'gmail' || !process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
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

const sendOTPEmail = async (toEmail, otp, userName = '', type = 'reset') => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[EMAIL] EMAIL_USER or EMAIL_PASS not configured. OTP will only be logged.');
    return false;
  }

  const isVerify = type === 'verify';
  const subject  = isVerify
    ? '[EduMatch] Xác thực email đăng ký tài khoản'
    : '[EduMatch] Mã xác thực khôi phục mật khẩu';
  const title    = isVerify ? 'Xác thực email của bạn' : 'Khôi phục mật khẩu';
  const subtitle = isVerify
    ? 'Hoàn tất đăng ký tài khoản EduMatch'
    : 'Đặt lại mật khẩu tài khoản EduMatch';
  const bodyText = isVerify
    ? 'Bạn vừa đăng ký tài khoản EduMatch. Vui lòng sử dụng mã OTP dưới đây để xác thực địa chỉ email của bạn:'
    : 'Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản EduMatch. Vui lòng sử dụng mã OTP dưới đây để đặt lại mật khẩu:';
  const warningText = isVerify
    ? '⚠️ Mã OTP này <strong>sẽ hết hạn sau 10 phút</strong>. Không chia sẻ mã này với bất kỳ ai.'
    : '⚠️ Mã OTP này <strong>sẽ hết hạn sau 10 phút</strong>. Không chia sẻ mã này với bất kỳ ai.';

  try {
    const transporter = createTransporter();
    console.log('[EMAIL] Attempting to send to:', toEmail, '| from:', process.env.EMAIL_USER);
    const info = await transporter.sendMail({
      from: `"EduMatch 🎓" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
            .container { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #2563eb, #1a4fd6); padding: 36px 32px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
            .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
            .body { padding: 40px 32px; }
            .greeting { color: #1e293b; font-size: 16px; font-weight: 600; margin-bottom: 16px; }
            .text { color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
            .otp-box { background: #eff6ff; border: 2px dashed #2563eb; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
            .otp-code { font-size: 40px; font-weight: 900; color: #2563eb; letter-spacing: 8px; font-family: monospace; }
            .otp-label { color: #94a3b8; font-size: 12px; margin-top: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; color: #92400e; font-size: 13px; margin: 20px 0; }
            .footer { background: #f8fafc; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 EduMatch</h1>
              <p>${subtitle}</p>
            </div>
            <div class="body">
              <p class="greeting">Xin chào${userName ? ` ${userName}` : ''}!</p>
              <p class="text">${bodyText}</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <div class="otp-label">Mã xác thực (OTP)</div>
              </div>
              <div class="warning">${warningText}</div>
              <p class="text">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email. Tài khoản của bạn vẫn an toàn.</p>
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
    console.log(`[EMAIL] ${type} OTP sent successfully to ${toEmail} | messageId:`, info.messageId);
    return true;
  } catch (err) {
    console.error('[EMAIL] Failed to send OTP email:', err.message);
    console.error('[EMAIL] Full error:', JSON.stringify({ code: err.code, command: err.command, response: err.response, responseCode: err.responseCode }));
    console.error('[EMAIL] EMAIL_USER configured:', !!process.env.EMAIL_USER, '→', process.env.EMAIL_USER?.substring(0, 8) + '***');
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

// @desc    Send email verification OTP (before completing registration)
// @route   POST /api/auth/send-verify-otp
// @access  Public
const sendVerifyOTP = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ message: 'Email là bắt buộc' });

    // Check if already registered
    const existing = await User.findOne({ email });
    if (existing && existing.isEmailVerified) {
      return res.status(400).json({ message: 'Email này đã được đăng ký. Vui lòng đăng nhập.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP temporarily — reuse resetPassword fields for simplicity
    // (or on the existing unverified user if exists)
    if (existing) {
      existing.resetPasswordOTP = otp;
      existing.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
      await existing.save();
    } else {
      // Store in a temporary map in memory — but for persistence across restarts
      // we'll create a temp unverified user or use a separate in-memory store
      // Simplest reliable approach: store on a temp user doc
      const tempUser = await User.findOneAndUpdate(
        { email, isEmailVerified: false },
        {
          $set: {
            resetPasswordOTP: otp,
            resetPasswordOTPExpires: Date.now() + 10 * 60 * 1000,
          }
        },
        { upsert: false, new: true }
      );
      if (!tempUser) {
        // No user yet — just keep OTP in response (user will submit with registration)
        // Use a signed temporary token approach: store otp in a simple in-memory store
        if (!global._emailOTPStore) global._emailOTPStore = {};
        global._emailOTPStore[email] = {
          otp,
          expires: Date.now() + 10 * 60 * 1000,
          name: name || '',
        };
      }
    }

    console.log(`[VERIFY OTP] ${email} → ${otp}`);
    const emailSent = await sendOTPEmail(email, otp, name || '', 'verify');

    res.json({
      success: true,
      message: emailSent
        ? 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.'
        : `Mã OTP: ${otp} (email chưa cấu hình)`,
      ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
    });
  } catch (error) {
    console.error('Send Verify OTP Error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// @desc    Verify email OTP (confirm email before/after registration)
// @route   POST /api/auth/verify-email-otp
// @access  Public
const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email và OTP là bắt buộc' });

    // Check DB first (existing user flow)
    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() },
    });

    if (user) {
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpires = undefined;
      await user.save();
      return res.json({ success: true, message: 'Xác thực email thành công!' });
    }

    // Check in-memory store (new user not yet created)
    const stored = global._emailOTPStore?.[email];
    if (stored && stored.otp === otp && stored.expires > Date.now()) {
      // Mark as verified — store a verified flag so register can proceed
      global._emailOTPStore[email].verified = true;
      return res.json({ success: true, message: 'Xác thực email thành công!' });
    }

    return res.status(400).json({ message: 'Mã OTP không chính xác hoặc đã hết hạn.' });
  } catch (error) {
    console.error('Verify Email OTP Error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};


// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, school, grade = '12', majorInterest = '' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Check email was verified via OTP
    const verified = global._emailOTPStore?.[email]?.verified;
    if (!verified) {
      return res.status(400).json({ message: "Email chưa được xác thực. Vui lòng xác thực OTP trước khi đăng ký." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Clean up OTP store
    if (global._emailOTPStore?.[email]) delete global._emailOTPStore[email];

    const count = await User.countDocuments();
    let finalRole = req.body.role || "student";
    if (count === 0) finalRole = "admin";

    const user = await User.create({
      name,
      email,
      password,
      isEmailVerified: true,
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

      res.status(201).json({
        success: true,
        data: {
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
          subscription: user.subscription,
          academicInfo: user.academicInfo,
          favorites: user.favorites,
          personalityTest: user.personalityTest,
          skillEvaluation: user.skillEvaluation,
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
    const { token, email: requestEmail, name: requestName, avatar: requestAvatar } = req.body;

    let email = requestEmail;
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

      email = payload.email;
      name = payload.name || email.split("@")[0];
      avatar = payload.picture || avatar;
    }

    if (!email) {
      return res.status(400).json({ message: "Google email is required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
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
        subscription: user.subscription,
        academicInfo: user.academicInfo,
        favorites: user.favorites,
        personalityTest: user.personalityTest,
        skillEvaluation: user.skillEvaluation,
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

    // Attempt to send email — fall back gracefully if email not configured
    const emailSent = await sendOTPEmail(email, otp, user.name, 'reset');

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
  sendVerifyOTP,
  verifyEmailOTP,
};
