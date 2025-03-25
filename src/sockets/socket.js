const userModel = require("../models/userModel");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    socket.on("get-following", async (userId) => {
      if (!userId) {
        return socket.emit("error", { message: "User ID is required" });
      }

      try {
        const user = await userModel
          .findById(userId)
          .select("following")
          .populate("following");

        if (!user) {
          return socket.emit("error", { message: "User not found" });
        }

        socket.emit("send-following", user.following || []);
      } catch (error) {
        console.error("❌ Error fetching followings:", error);
        socket.emit("error", { message: "Failed to fetch followings" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
