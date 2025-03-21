require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "your_secret_key";

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

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
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

    res.json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await userModel
      .findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true,
      })
      .select("-password");

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
    const userId = req.user.userId;
    const { status } = req.query;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const user = await userModel.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      success: true,
      message: "User status updated successfully",
      status: user.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addFollowing = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { followingId } = req.params;
    if (!followingId) {
      return res.status(400).json({ message: "Following ID is required" });
    }
    const user = await userModel.findByIdAndUpdate(
      userId,
      { $push: { following: followingId } },
      { new: true }
    );
    await userModel.findByIdAndUpdate(
      followingId,
      { $push: { follower: userId } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      success: true,
      message: "Following added successfully",
      following: user.following,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addSaved = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { item, itemType } = req.query;

    if (!item || !itemType) {
      return res
        .status(400)
        .json({ message: "Item ID and item type are required" });
    }
    const user = await userModel.findByIdAndUpdate(
      userId,
      { $push: { saved: { item, itemType } } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      success: true,
      message: "Added successfully",
      saved: user.saved,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  updateUser,
  updateUserStatus,
  addFollowing,
  addSaved,
};
