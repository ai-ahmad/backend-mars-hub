const userModel = require("../../models/userModel");

const handleDisconnect = async (io, userIdRef) => {
  if (!userIdRef.current) return;

  try {
    const user = await userModel
      .findByIdAndUpdate(
        userIdRef.current,
        { status: "offline" },
        { new: true }
      )
      .populate("followers", "_id");

    user.followers.forEach((follower) => {
      io.to(`user-${follower._id}`).emit("user-status-updated", {
        userId: userIdRef.current,
        status: "offline",
      });
    });

    socket.leaveAll();
    console.log(`🟠 User ${userIdRef.current} has left all rooms`);
  } catch (error) {
    console.error("❌ Error updating user status on disconnect:", error);
  }
};

module.exports = handleDisconnect;
