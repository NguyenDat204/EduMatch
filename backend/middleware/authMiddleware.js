const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token — this is fast (CPU only, no DB)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach a lightweight user stub from JWT payload immediately.
      // Full DB fetch is only done when the route explicitly needs full user data.
      // Most routes only need decoded.id for ownership checks.
      req.user = { _id: decoded.id, id: decoded.id };

      // Lazy-load full user only for routes that require full profile data.
      // Routes can call req.loadUser() if they need the full document.
      req.loadUser = async () => {
        if (req.user && req.user.email) return req.user; // already loaded
        const fullUser = await User.findById(decoded.id).select("-password");
        if (!fullUser) throw new Error("User not found");
        req.user = fullUser;
        return req.user;
      };

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// For routes that truly need the full user document (profile, chat, etc.)
const requireFullUser = async (req, res, next) => {
  try {
    await req.loadUser();
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, user not found" });
  }
};

const admin = async (req, res, next) => {
  try {
    // req.user may only have {_id, id} from the optimised protect middleware.
    // Load the full document to check the role (one DB call, cached on req.user).
    if (!req.user.role) {
      await req.loadUser();
    }
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Not authorized as an admin" });
    }
  } catch {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

module.exports = { protect, requireFullUser, admin };
