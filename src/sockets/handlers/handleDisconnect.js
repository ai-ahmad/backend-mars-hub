const userModel = require("../../models/userModel");

const handleDisconnect = async (io, socket, userId) => {
  if (!userId) {
    console.log("No userId provided for disconnect");
    return;
  }

  console.log(userId)

  try {
    const user = await userModel
      .findByIdAndUpdate(userId, { status: "offline" }, { new: true })
      .populate("followers")
      .populate("following");

    if (!user) {
      console.log(`User ${userId} not found during disconnect`);
      return;
    }

    const rooms = [
      ...user.following.map((followedUser) => `user-${followedUser._id}`),
      `user-${userId}`,
    ];

    if (rooms.length > 0) {
      io.to(rooms).emit("user-status-updated", {
        userId: userId.toString(),
        status: "offline",
      });
    } else {
      console.log(`No rooms to emit user-status-updated for user ${userId}`);
    }

    rooms.forEach((room) => {
      socket.leave(room);
      console.log(`Socket ${socket.id} left room ${room}`);
    });
  } catch (error) {
    console.error("❌ Error updating user status on disconnect:", error);
  }
};

module.exports = handleDisconnect;
