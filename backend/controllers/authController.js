const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require("nodemailer");
const { Resend } = require("resend");
const User = require("../models/User");
const EmailOTP = require("../models/EmailOTP");
const University = require("../models/University");

// ==================== CONSTANTS ====================
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const VERIFY_WINDOW_MS = 30 * 60 * 1000;

// ==================== EMAIL SERVICE ====================
// Priority:
//  1. Resend HTTP API (RESEND_API_KEY)        — production on Render (no SMTP ports needed)
//  2. Nodemailer SMTP (EMAIL_USER+EMAIL_PASS) — local dev only

const isEmailConfigured = () =>
  !!(process.env.RESEND_API_KEY || (process.env.EMAIL_USER && process.env.EMAIL_PASS));

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const getExpiresAt = () => new Date(Date.now() + OTP_EXPIRY_MS);

const buildEmailHtml = (otp, userName, type) => {
  const isVerify = type === 'verify';
  const subtitle = isVerify
    ? 'Hoàn tất đăng ký tài khoản EduMatch'
    : 'Đặt lại mật khẩu tài khoản EduMatch';
  const bodyText = isVerify
    ? 'Bạn vừa đăng ký tài khoản EduMatch. Vui lòng sử dụng mã OTP dưới đây để xác thực địa chỉ email của bạn:'
    : 'Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản EduMatch. Vui lòng sử dụng mã OTP dưới đây để đặt lại mật khẩu:';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;margin:0;padding:0}
.container{max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.header{background:linear-gradient(135deg,#2563eb,#1a4fd6);padding:36px 32px;text-align:center}
.header h1{color:#fff;margin:0;font-size:24px;font-weight:700}
.header p{color:rgba(255,255,255,.8);margin:8px 0 0;font-size:14px}
.body{padding:40px 32px}
.greeting{color:#1e293b;font-size:16px;font-weight:600;margin-bottom:16px}
.text{color:#64748b;font-size:14px;line-height:1.6;margin-bottom:24px}
.otp-box{background:#eff6ff;border:2px dashed #2563eb;border-radius:12px;padding:24px;text-align:center;margin:24px 0}
.otp-code{font-size:40px;font-weight:900;color:#2563eb;letter-spacing:8px;font-family:monospace}
.otp-label{color:#94a3b8;font-size:12px;margin-top:8px;font-weight:600;text-transform:uppercase;letter-spacing:1px}
.warning{background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 8px 8px 0;color:#92400e;font-size:13px;margin:20px 0}
.footer{background:#f8fafc;padding:20px 32px;text-align:center;color:#94a3b8;font-size:12px;border-top:1px solid #e2e8f0}
</style></head><body><div class="container">
<div class="header"><h1>EduMatch</h1><p>${subtitle}</p></div>
<div class="body">
  <p class="greeting">Xin chào${userName ? ` ${userName}` : ''}!</p>
  <p class="text">${bodyText}</p>
  <div class="otp-box">
    <div class="otp-code">${otp}</div>
    <div class="otp-label">Mã xác thực (OTP)</div>
  </div>
  <div class="warning">Mã OTP này <strong>sẽ hết hạn sau 10 phút</strong>. Không chia sẻ mã này với bất kỳ ai.</div>
  <p class="text">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email. Tài khoản của bạn vẫn an toàn.</p>
</div>
<div class="footer">
  <p>&copy; ${new Date().getFullYear()} EduMatch &middot; Tất cả quyền được bảo lưu</p>
  <p style="margin-top:4px">Email này được gửi tự động, vui lòng không trả lời.</p>
</div>
</div></body></html>`;
};

const sendOTPEmail = async (toEmail, otp, userName = '', type = 'reset') => {
  const isVerify = type === 'verify';
  const subject  = isVerify
    ? '[EduMatch] Xác thực email đăng ký tài khoản'
    : '[EduMatch] Mã xác thực khôi phục mật khẩu';
  const htmlBody = buildEmailHtml(otp, userName, type);

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.RESEND_FROM || 'EduMatch <onboarding@resend.dev>';
      const { error } = await resend.emails.send({ from, to: toEmail, subject, html: htmlBody });
      if (error) {
        console.error('[EMAIL] Resend API error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[EMAIL] Resend API failed:', err.message);
      return false;
    }
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('[EMAIL] No email provider configured.');
    return false;
  }

  try {
    const port = parseInt(process.env.EMAIL_SMTP_PORT || '587', 10);
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
    const fromAddress = process.env.EMAIL_FROM
      ? `"EduMatch" <${process.env.EMAIL_FROM}>`
      : `"EduMatch" <${process.env.EMAIL_USER}>`;
    await transporter.sendMail({ from: fromAddress, to: toEmail, subject, html: htmlBody });
    return true;
  } catch (err) {
    console.error('[EMAIL] SMTP failed:', err.code, err.message);
    return false;
  }
};

const respondOTPSent = (res, emailSent, otp) => {
  if (emailSent) {
    return res.json({
      success: true,
      message: 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (bao gồm thư mục Spam).',
      ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
    });
  }

  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({
        message: 'Hệ thống email chưa được cấu hình. Vui lòng liên hệ quản trị viên.',
      });
    }
    return res.json({
      success: true,
      message: 'Chế độ dev: email chưa cấu hình. Sử dụng mã OTP bên dưới.',
      devOtp: otp,
    });
  }

  return res.status(500).json({
    message: 'Không thể gửi email. Vui lòng thử lại sau.',
  });
};

const upsertOTP = async (email, type, otp, metadata = {}) => {
  return EmailOTP.findOneAndUpdate(
    { email, type },
    {
      otp,
      expiresAt: getExpiresAt(),
      verifiedAt: undefined,
      metadata,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

// ==================== AUTH HELPERS ====================
const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ==================== CONTROLLERS ====================

// @route   POST /api/auth/send-verify-otp
const sendVerifyOTP = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ message: 'Email là bắt buộc' });

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing && existing.isEmailVerified) {
      return res.status(400).json({ message: 'Email này đã được đăng ký. Vui lòng đăng nhập.' });
    }

    const otp = generateOTP();
    await upsertOTP(normalizedEmail, 'verify', otp, { name: name || '' });

    const emailSent = await sendOTPEmail(normalizedEmail, otp, name || '', 'verify');
    return respondOTPSent(res, emailSent, otp);
  } catch (error) {
    console.error('Send Verify OTP Error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// @route   POST /api/auth/verify-email-otp
const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email và OTP là bắt buộc' });

    const normalizedEmail = email.toLowerCase().trim();
    const record = await EmailOTP.findOne({
      email: normalizedEmail,
      type: 'verify',
      otp,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).json({ message: 'Mã OTP không chính xác hoặc đã hết hạn.' });
    }

    record.verifiedAt = new Date();
    await record.save();

    res.json({ success: true, message: 'Xác thực email thành công!' });
  } catch (error) {
    console.error('Verify Email OTP Error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, school, grade = '12', majorInterest = '' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const verifyRecord = await EmailOTP.findOne({
      email: normalizedEmail,
      type: 'verify',
      verifiedAt: { $exists: true, $gt: new Date(Date.now() - VERIFY_WINDOW_MS) },
    });

    if (!verifyRecord) {
      return res.status(400).json({
        message: 'Email chưa được xác thực. Vui lòng xác thực OTP trước khi đăng ký.',
      });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists && userExists.isEmailVerified) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const count = await User.countDocuments();
    let finalRole = req.body.role || 'student';
    if (count === 0) finalRole = 'admin';

    let user = await User.findOne({ email: normalizedEmail, isEmailVerified: false });
    if (user) {
      user.name = name;
      user.password = password;
      user.isEmailVerified = true;
      user.role = finalRole;
      user.academicInfo = { school: school || '', grade: grade || '12', majorInterest: majorInterest || '' };
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpires = undefined;
      await user.save();
    } else {
      user = await User.create({
        name,
        email: normalizedEmail,
        password,
        isEmailVerified: true,
        role: finalRole,
        academicInfo: { school: school || '', grade: grade || '12', majorInterest: majorInterest || '' },
      });
    }

    await EmailOTP.deleteOne({ email: normalizedEmail, type: 'verify' });

    if (user) {
      if (finalRole === 'university') {
        const universityName = school || 'Dai hoc FPT (FPT University)';
        let uni = await University.findOne({ name: { $regex: new RegExp('^' + universityName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') } });
        if (!uni) {
          uni = await University.create({ name: universityName, location: 'Ha Noi, Viet Nam', representativeId: user._id });
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
          _id: user._id, name: user.name, email: user.email, role: user.role,
          avatar: user.avatar, isPro: user.isPro, subscription: user.subscription,
          academicInfo: user.academicInfo, favorites: user.favorites,
          personalityTest: user.personalityTest, skillEvaluation: user.skillEvaluation,
          universityId: user.universityId,
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @route   POST /api/auth/login
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Email chưa được xác thực. Vui lòng hoàn tất đăng ký hoặc liên hệ hỗ trợ.',
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id, name: user.name, email: user.email, role: user.role,
        avatar: user.avatar, isPro: user.isPro, subscription: user.subscription,
        academicInfo: user.academicInfo, favorites: user.favorites,
        personalityTest: user.personalityTest, skillEvaluation: user.skillEvaluation,
        universityId: user.universityId,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @route   POST /api/auth/google
const googleLogin = async (req, res) => {
  try {
    const { token, email: requestEmail, name: requestName, avatar: requestAvatar } = req.body;
    let email = requestEmail, name = requestName, avatar = requestAvatar;

    if (token) {
      if (!googleClient) return res.status(500).json({ message: 'Google login is not configured on the server.' });
      const ticket = await googleClient.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
      const payload = ticket.getPayload();
      if (!payload || !payload.email || payload.email_verified !== true) {
        return res.status(401).json({ message: 'Invalid Google token or unverified email.' });
      }
      email = payload.email;
      name = payload.name || email.split('@')[0];
      avatar = payload.picture || avatar;
    }

    if (!email) return res.status(400).json({ message: 'Google email is required' });

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = await User.create({
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: Math.random().toString(36).slice(-10),
        role: 'student',
        isEmailVerified: true,
        avatar: avatar || `https://i.pravatar.cc/150?u=${normalizedEmail}`,
      });
    } else if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      if (avatar && !user.avatar) user.avatar = avatar;
      await user.save();
    }

    res.json({
      success: true,
      data: {
        _id: user._id, name: user.name, email: user.email, role: user.role,
        avatar: user.avatar, isPro: user.isPro, subscription: user.subscription,
        academicInfo: user.academicInfo, favorites: user.favorites,
        personalityTest: user.personalityTest, skillEvaluation: user.skillEvaluation,
        universityId: user.universityId,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ message: 'Server error during Google auth', error: error.message });
  }
};

// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email là bắt buộc' });

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này' });

    const otp = generateOTP();
    await upsertOTP(normalizedEmail, 'reset', otp, { name: user.name || '' });

    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    const emailSent = await sendOTPEmail(normalizedEmail, otp, user.name, 'reset');
    return respondOTPSent(res, emailSent, otp);
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ trong quá trình khôi phục mật khẩu', error: error.message });
  }
};

// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ các thông tin yêu cầu' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let record = await EmailOTP.findOne({
      email: normalizedEmail,
      type: 'reset',
      otp,
      expiresAt: { $gt: new Date() },
    });

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });

    // Legacy fallback: OTP stored on User before EmailOTP migration
    if (!record && user.resetPasswordOTP === otp) {
      const legacyExpires = user.resetPasswordOTPExpires;
      const expiresMs = legacyExpires instanceof Date ? legacyExpires.getTime() : Number(legacyExpires);
      if (!expiresMs || expiresMs <= Date.now()) {
        return res.status(400).json({ message: 'Mã OTP không chính xác hoặc đã hết hạn' });
      }
    } else if (!record) {
      return res.status(400).json({ message: 'Mã OTP không chính xác hoặc đã hết hạn' });
    }

    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    await EmailOTP.deleteOne({ email: normalizedEmail, type: 'reset' });

    res.json({ success: true, message: 'Mật khẩu của bạn đã được thay đổi thành công! Vui lòng đăng nhập lại.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ trong quá trình đặt lại mật khẩu', error: error.message });
  }
};

// @route   PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const isValid = await user.matchPassword(currentPassword);
    if (!isValid) return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Mật khẩu đã được thay đổi thành công!' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

module.exports = {
  registerUser, authUser, googleLogin,
  forgotPassword, resetPassword, changePassword,
  sendVerifyOTP, verifyEmailOTP,
};
