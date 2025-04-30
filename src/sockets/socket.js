const handleDisconnect = require("./handlers/handleDisconnect");
const handleGetFollowing = require("./handlers/handleGetFollowing");
const handleMessenger = require("./handlers/handleMessenger");
const Messenger = require("../models/messangerModel");

const socketHandler = (io) => {
  io.on("connection", (socket) => {

    socket.on("get-following", async (userId) => {
      socket.connectedUserId = userId;
      await handleGetFollowing(io, socket, userId);
    });

    socket.on("join-room", async (roomId) => {
      try {
        socket.join(roomId);
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
      await handleDisconnect(io, socket, socket.connectedUserId);
    });
  });
};

module.exports = socketHandler;
