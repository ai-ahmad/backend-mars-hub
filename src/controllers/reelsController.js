const reelsModel = require("../models/reelsModel");

const addOrRemoveLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const reel = await reelsModel.findById(id);
    if (!reel) return res.status(404).json({ message: "Reel not found" });

    const isLiked = reel.likes.includes(userId);

    const updatedReel = await reelsModel.findByIdAndUpdate(
      id,
      isLiked ? { $pull: { likes: userId } } : { $push: { likes: userId } },
      { new: true }
    );

    res.status(200).json({message: `Like ${isLiked ? "removed" : "added"}!`, reel: updatedReel});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addView = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const reel = await reelsModel.findById(id);
    if (!reel) return res.status(404).json({ message: "Reel not found" });
    const isViewed = reel.views.includes(userId);
    if (!isViewed) {
      const updatedReel = await reelsModel.findByIdAndUpdate(
        id,
        { $push: { views: userId } },
        { new: true }
      );
      return res.status(200).json({ message: "view added", reel: updatedReel });
    }
    res.status(200).json({message: "Already viewed", reel});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addOrRemoveLike, addView };
