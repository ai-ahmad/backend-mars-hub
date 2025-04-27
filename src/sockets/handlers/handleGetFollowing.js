const userModel = require("../../models/userModel");

const handleGetFollowing = async (io, socket, userIdRef, userId) => {
  if (!userId) {
    return socket.emit("error", { message: "User ID is required" });
  }

  try {
    userIdRef.current = userId;

    const user = await userModel
      .findByIdAndUpdate(userId, { status: "online" }, { new: true })
      .select("following followers")
      .populate("following")
      .populate("followers");

    if (!user) {
      return socket.emit("error", { message: "User not found" });
    }

    user.following.forEach((followedUser) => {
      socket.join(`user-${followedUser._id}`);
    });

    user.followers.forEach((follower) => {
      socket.join(`user-${follower._id}`);
    });

    socket.emit("send-following", user.following);

    user.followers.forEach((follower) => {
      io.to(`user-${follower._id}`).emit("user-status-updated", {
        userId,
        status: "online",
      });
    });
    user.following.forEach((followedUser) => {
      io.to(`user-${followedUser._id}`).emit("user-status-updated", {
        userId,
        status: "online",
      });
    });
  } catch (error) {
    console.error("❌ Error in get-following:", error);
    socket.emit("error", { message: "Failed to fetch followings" });
  }
};

module.exports = handleGetFollowing;
