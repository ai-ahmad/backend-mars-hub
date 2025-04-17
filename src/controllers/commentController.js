const commentModel = require("../models/commentModel");

const addOrRemoveLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const comment = await commentModel.findById(commentId);
    if (!comment) return res.status(404).json({ message: "comment not found" });

    const isLiked = comment.likes.includes(userId);

    const updatedComment = await commentModel.findByIdAndUpdate(
      commentId,
      isLiked ? { $pull: { likes: userId } } : { $push: { likes: userId } },
      { new: true }
    );

    res
      .status(200)
      .json({
        message: `Comment ${isLiked ? "liked" : "unliked"}!`,
        comment: updatedComment,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addOrRemoveLike };


// comment controlets all functions crud 