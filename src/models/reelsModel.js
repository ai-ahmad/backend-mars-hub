const mongoose = require("mongoose");

const ReelsModel = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: { type: String, trim: true },
    media: { type: String, required: true },
    type: { type: String, enum: ["video", "image"] },
    hashtags: [{ type: String }],
    isPublic: { type: Boolean, default: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    views: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Reel", ReelsModel);
