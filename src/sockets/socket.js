const userModel = require("../models/userModel");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    socket.on("get-following", async () => {
      try {
        const followings = await userModel.find().select("following");
        socket.emit("users", followings);
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
