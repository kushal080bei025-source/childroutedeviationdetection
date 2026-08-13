const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../../db/User");

// @desc    Get all users
// @route   GET /api/users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({})
      .populate("purchasedDevicesCount")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Create new user
// @route   POST /api/users
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      authProvider,
      bio,
      profilePicture,
      status,
      adminAccess,
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Generate unique UID if not provided
    const uid =
      req.body.uid || `user_${Math.random().toString(36).substr(2, 9)}`;

    const user = new User({
      uid,
      authProvider: authProvider || "local",
      name,
      email,
      password,
      phone,
      bio,
      profilePicture: null,
      status: status || "active",
      adminAccess: adminAccess || false,
      location: {
        lat: 37.7749,
        lng: -122.4194,
        updatedAt: new Date(),
      },
    });

    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid user data", error: error.message });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    // user.profilePicture = req.body.profilePicture || user.profilePicture;
    user.status = req.body.status || user.status;
    user.adminAccess =
      req.body.adminAccess !== undefined
        ? req.body.adminAccess
        : user.adminAccess;

    if (req.body.password && user.authProvider === "local") {
      user.password = req.body.password;
    }

    if (req.body.location) {
      user.location = {
        lat: req.body.location.lat || user.location.lat,
        lng: req.body.location.lng || user.location.lng,
        updatedAt: new Date(),
      };
    }
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating user", error: error.message });
  }
});

// @desc    Change a user's password by email (dev/testing only)
// @route   POST /api/users/ChangePassword
router.post("/ChangePassword", async (req, res) => {
  try {
    console.log("ChangePassword request body:", req.body);
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: "email and newPassword are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Change the logged-in user's own password
// @route   POST /api/users/change-password
router.post("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "currentPassword and newPassword are required" });
    }

    const user = req.dbUser;
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (user.authProvider !== "local") {
      return res.status(400).json({
        message: "Password change is only available for local accounts",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.deleteOne({ _id: req.params.id });
    res.json({ message: "User removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
