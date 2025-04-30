require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "your_secret_key";

const populateFields = [
  "publications",
  "reels",
  "saved.item",
  "followers",
  "following",
];

const register = async (req, res) => {
  try {
    const { username, password, firstName, lastName, email } = req.body;
    if (!username || !password || !firstName || !lastName || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUsername = await userModel.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingEmail = await userModel.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      email,
    });

    await newUser.save();

    const populatedUser = await userModel
      .findById(newUser._id)
      .select("-password");

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: populatedUser,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    const userWithoutPassword = await userModel
      .findOne({ username })
      .select("-password");

    res.json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await userModel
      .findOne({ username })
      .select("-password")
      .populate(["publications", "reels", "followers", "following"]);
    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await userModel
      .findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      })
      .select("-password")
      .populate(populateFields);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const user = await userModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const populatedUser = await userModel
      .findById(user._id)
      .populate(populateFields);

    if (req.io) {
      req.io.to(`user-${id}`).emit("user-status-updated", {
        userId: id,
        status,
        updatedUser: populatedUser,
      });
    } else {
      console.warn("⚠️ WebSocket io не доступен для отправки уведомления!");
    }

    res.json({
      success: true,
      message: "User status updated successfully",
      user: populatedUser,
    });
  } catch (error) {
    console.error("❌ Error updating user status:", error);
    res.status(500).json({ message: error.message });
  }
};

const addFollowing = async (req, res) => {
  try {
    const { followingId, id } = req.params;

    if (!id || !followingId) {
      return res
        .status(400)
        .json({ message: "User ID and Following ID are required" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(followingId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid User ID or Following ID format" });
    }

    const user = await userModel.findById(id);
    const followingUser = await userModel.findById(followingId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!followingUser) {
      return res.status(404).json({ message: "User to follow not found" });
    }

    if (id === followingId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    if (user.following.includes(followingId)) {
      return res
        .status(400)
        .json({ message: "You are already following this user" });
    }

    const newUser = await userModel.findByIdAndUpdate(
      id,
      { $push: { following: followingId } },
      { new: true }
    );

    await userModel.findByIdAndUpdate(
      followingId,
      { $push: { followers: id } },
      { new: true }
    );

    res.json({
      success: true,
      message: "Following added successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error in addFollowing:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

const addSaved = async (req, res) => {
  try {
    const { id } = req.params;
    const { item, itemType } = req.query;

    if (!item || !itemType) {
      return res
        .status(400)
        .json({ message: "Item ID and item type are required" });
    }
    const user = await userModel.findByIdAndUpdate(
      id,
      { $push: { saved: { item, itemType } } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const populatedUser = await userModel
      .findById(user._id)
      .populate(populateFields);

    res.json({
      success: true,
      message: "Added successfully",
      user: populatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const updateProfilePhoto = async (req, res) => {

// }

module.exports = {
  register,
  login,
  updateUser,
  updateUserStatus,
  addFollowing,
  addSaved,
  getUserByUsername,
  // updateProfilePhoto
};

// testing code 2
