const handleDisconnect = require("./handlers/handleDisconnect");
const handleGetFollowing = require("./handlers/handleGetFollowing");
const handleMessenger = require("./handlers/handleMessenger");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    let connectedUserId = null;

    socket.on("get-following", async (userId) => {
      await handleGetFollowing(io, socket, connectedUserId, userId);
    });

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`🟢 User ${socket.id} joined room: ${roomId}`);
    });

    socket.on("send-message", async ({ roomId, message, sender }) => {
      await handleMessenger(io, socket, roomId, message, sender);
    });

    socket.on("disconnect", async () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
      await handleDisconnect(io, connectedUserId);
    });
  });
};

module.exports = socketHandler;
