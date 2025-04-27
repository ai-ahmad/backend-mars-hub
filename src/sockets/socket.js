const handleDisconnect = require("./handlers/handleDisconnect");
const handleGetFollowing = require("./handlers/handleGetFollowing");
const handleMessenger = require("./handlers/handleMessenger");
const Messenger = require("../models/messangerModel");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    socket.on("get-following", async (userId) => {
      socket.connectedUserId = userId;
      await handleGetFollowing(io, socket, userId);
    });

    socket.on("join-room", async (roomId) => {
      try {
        socket.join(roomId);
        console.log(`🟢 User ${socket.id} joined room: ${roomId}`);
      } catch (err) {
        console.error("Error in join-room:", err);
      }
    });

    socket.on("get-room-messages", async (roomId) => {
      try {
        const messenger = await Messenger.findOne({ roomId })
          .populate("messages.sender")
          .exec();

        if (messenger) {
          socket.emit("room-messages", messenger.messages);
        } else {
          socket.emit("room-messages", []);
        }
      } catch (error) {
        socket.emit("error", { message: "Failed to load room messages" });
      }
    });

    socket.on("send-message", async ({ roomId, message, sender }) => {
      await handleMessenger(io, socket, roomId, message, sender);
    });

    socket.on("disconnect", async () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
      await handleDisconnect(io, socket, socket.connectedUserId);
    });
  });
};

module.exports = socketHandler;
