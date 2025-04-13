const mongoose = require("mongoose");

const commentModel = new mongoose.Schema(
  {
    media: {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "itemType",
      },
      itemType: { type: String, required: true, enum: ["Reel", "Publication"] },
    },
    author: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", commentModel);
