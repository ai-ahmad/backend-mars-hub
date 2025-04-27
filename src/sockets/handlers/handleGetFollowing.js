const userModel = require("../../models/userModel");

const handleGetFollowing = async (io, socket, userId) => {
  if (!userId) {
    return socket.emit("error", { message: "User ID is required" });
  }

  try {
    const user = await userModel
      .findByIdAndUpdate(userId, { status: "online" }, { new: true })
      .select("following followers")
      .populate("following")
      .populate("followers");

    if (!user) {
      return socket.emit("error", { message: "User not found" });
    }

    socket.join(`user-${userId}`);
    const rooms = [
      ...user.following.map((followedUser) => {
        socket.join(`user-${followedUser._id}`);
        return `user-${followedUser._id}`;
      }),
      `user-${userId}`,
    ];

    socket.emit("send-following", user.following);

    io.to(rooms).emit("user-status-updated", {
      userId: userId.toString(),
      status: "online",
    });
  } catch (error) {
    console.error("❌ Error in get-following:", error);
    socket.emit("error", { message: "Failed to fetch followings" });
  }
};

module.exports = handleGetFollowing;
