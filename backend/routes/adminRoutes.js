const express = require("express");
const router = express.Router();
const { getUsers, updateUser, deleteUser, getSystemAnalytics } = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/users", protect, admin, getUsers);
router.put("/users/:id", protect, admin, updateUser);
router.delete("/users/:id", protect, admin, deleteUser);
router.get("/analytics", protect, admin, getSystemAnalytics);

module.exports = router;
