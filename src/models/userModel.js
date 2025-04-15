const mongoose = require("mongoose");

const userModel = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthdate: { type: Date },
    location: { type: String },
    reputation: { type: Number, default: 0 },
    grade: {
      type: String,
      enum: ["teamleader", "senior", "middle", "junior", "intern"],
      default: "intern"
    },
    email: { type: String, required: true, unique: true },
    status: { type: String, enum: ["online", "offline"], default: "offline" },
    profileImage: {
      type: String,
      default: "/uploads/default-images/profile.png",
    },
    bio: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    publications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Publication" }],
    reels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reel" }],
    saved: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, refPath: "itemType" },
        itemType: { type: String, enum: ["Reel", "Publication"] },
      },
    ],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userModel);
