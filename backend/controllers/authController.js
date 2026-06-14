const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require("nodemailer");
const { Resend } = require("resend");
const User = require("../models/User");
const University = require("../models/University");

// ==================== EMAIL SERVICE ====================
// Priority:
//  1. Resend HTTP API (RESEND_API_KEY)        — production on Render (no SMTP ports needed)
//  2. Nodemailer SMTP (EMAIL_USER+EMAIL_PASS) — local dev only

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
    <div class="otp-label">Ma xac thuc (OTP)</div>
  </div>
  <div class="warning">Ma OTP nay <strong>se het han sau 10 phut</strong>. Khong chia se ma nay voi bat ky ai.</div>
  <p class="text">Neu ban khong thuc hien yeu cau nay, vui long bo qua email. Tai khoan cua ban van an toan.</p>
</div>
<div class="footer">
  <p>&copy; ${new Date().getFullYear()} EduMatch &middot; Tat ca quyen duoc bao luu</p>
  <p style="margin-top:4px">Email nay duoc gui tu dong, vui long khong tra loi.</p>
</div>
</div></body></html>`;
};

const sendOTPEmail = async (toEmail, otp, userName = '', type = 'reset') => {
  const isVerify = type === 'verify';
  const subject  = isVerify
    ? '[EduMatch] Xac thuc email dang ky tai khoan'
    : '[EduMatch] Ma xac thuc khoi phuc mat khau';
  const htmlBody = buildEmailHtml(otp, userName, type);

  // ── Path 1: Resend HTTP API (production — Render) ────────────────────────
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.RESEND_FROM || 'EduMatch <onboarding@resend.dev>';
      await resend.emails.send({ from, to: toEmail, subject, html: htmlBody });
      return true;
    } catch (err) {
      console.error('[EMAIL] Resend API failed:', err.message);
    }
  }

  // ── Path 2: Nodemailer SMTP (local dev only) ──────────────────────────────
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('[EMAIL] No email provider configured.');
    return false;
  }
  try {
    const port = parseInt(process.env.EMAIL_SMTP_PORT || '587');
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
    // Allow overriding the From address (e.g. edumatchvn@gmail.com via Brevo sender verification)
    const fromAddress = process.env.EMAIL_FROM
      ? `"EduMatch" <${process.env.EMAIL_FROM}>`
      : `"EduMatch" <${process.env.EMAIL_USER}>`;
    await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject,
      html: htmlBody,
    });
    return true;
  } catch (err) {
    console.error('[EMAIL] SMTP failed:', err.code, err.message);
    return false;
  }
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
    if (!email) return res.status(400).json({ message: 'Email la bat buoc' });

    const existing = await User.findOne({ email });
    if (existing && existing.isEmailVerified) {
      return res.status(400).json({ message: 'Email nay da duoc dang ky. Vui long dang nhap.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000;

    if (!global._emailOTPStore) global._emailOTPStore = {};
    global._emailOTPStore[email] = { otp, expires, name: name || '', verified: false };

    if (existing && !existing.isEmailVerified) {
      existing.resetPasswordOTP = otp;
      existing.resetPasswordOTPExpires = expires;
      await existing.save();
    }

    const emailSent = await sendOTPEmail(email, otp, name || '', 'verify');

    res.json({
      success: true,
      message: emailSent
        ? 'Ma OTP da duoc gui den email cua ban. Vui long kiem tra hop thu.'
        : `Ma OTP: ${otp} (email chua cau hinh)`,
      ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
    });
  } catch (error) {
    console.error('Send Verify OTP Error:', error);
    res.status(500).json({ message: 'Loi may chu', error: error.message });
  }
};

// @route   POST /api/auth/verify-email-otp
const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email va OTP la bat buoc' });

    if (!global._emailOTPStore) global._emailOTPStore = {};
    const stored = global._emailOTPStore[email];
    if (stored && stored.otp === otp && stored.expires > Date.now()) {
      global._emailOTPStore[email].verified = true;
      return res.json({ success: true, message: 'Xac thuc email thanh cong!' });
    }

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() },
    });

    if (user) {
      global._emailOTPStore[email] = {
        otp,
        expires: user.resetPasswordOTPExpires,
        name: user.name || '',
        verified: true,
      };
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpires = undefined;
      await user.save();
      return res.json({ success: true, message: 'Xac thuc email thanh cong!' });
    }

    return res.status(400).json({ message: 'Ma OTP khong chinh xac hoac da het han.' });
  } catch (error) {
    console.error('Verify Email OTP Error:', error);
    res.status(500).json({ message: 'Loi may chu', error: error.message });
  }
};

// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, school, grade = '12', majorInterest = '' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const verified = global._emailOTPStore?.[email]?.verified;
    if (!verified) {
      return res.status(400).json({ message: 'Email chua duoc xac thuc. Vui long xac thuc OTP truoc khi dang ky.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists && userExists.isEmailVerified) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (global._emailOTPStore?.[email]) delete global._emailOTPStore[email];

    const count = await User.countDocuments();
    let finalRole = req.body.role || 'student';
    if (count === 0) finalRole = 'admin';

    let user = await User.findOne({ email, isEmailVerified: false });
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
        name, email, password,
        isEmailVerified: true,
        role: finalRole,
        academicInfo: { school: school || '', grade: grade || '12', majorInterest: majorInterest || '' },
      });
    }

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
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
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
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
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

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0], email,
        password: Math.random().toString(36).slice(-10),
        role: 'student',
        avatar: avatar || `https://i.pravatar.cc/150?u=${email}`,
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
    console.error('Google Login Error:', error);
    res.status(500).json({ message: 'Server error during Google auth', error: error.message });
  }
};

// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Khong tim thay tai khoan voi email nay' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const emailSent = await sendOTPEmail(email, otp, user.name, 'reset');

    res.json({
      success: true,
      message: emailSent
        ? 'Ma OTP da duoc gui den email cua ban. Vui long kiem tra hop thu (bao gom thu muc Spam).'
        : `Ma OTP cua ban la: ${otp} (Email chua duoc cau hinh tren server)`,
      ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Loi may chu trong qua trinh khoi phuc mat khau', error: error.message });
  }
};

// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Vui long dien day du cac thong tin yeu cau' });
    }

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Ma OTP khong chinh xac hoac da het han' });

    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Mat khau cua ban da duoc thay doi thanh cong! Vui long dang nhap lai.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Loi may chu trong qua trinh dat lai mat khau', error: error.message });
  }
};

// @route   PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Vui long dien day du thong tin' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Mat khau moi phai co it nhat 6 ky tu' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Khong tim thay nguoi dung' });

    const isValid = await user.matchPassword(currentPassword);
    if (!isValid) return res.status(400).json({ message: 'Mat khau hien tai khong dung' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Mat khau da duoc thay doi thanh cong!' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ message: 'Loi may chu', error: error.message });
  }
};

module.exports = {
  registerUser, authUser, googleLogin,
  forgotPassword, resetPassword, changePassword,
  sendVerifyOTP, verifyEmailOTP,
};
