const mongoose = require("mongoose");
const Messenger = require("../models/messenger");

const handleMessenger = async (io, socket, roomId, message, sender) => {
  try {
    if (!roomId) {
      return socket.emit("error", { message: "Room ID is required" });
    }

    if (sender && !mongoose.Types.ObjectId.isValid(sender)) {
      return socket.emit("error", { message: "Invalid sender ID" });
    }

    if (!message && !sender) {
      return socket.emit("error", { message: "Message or sender must be provided" });
    }

    const messageData = {
      sender: sender || null,
      text: message || "",
      createdAt: new Date(),
    };

    let messenger = await Messenger.findOne({ roomId });
    if (!messenger) {
      messenger = await Messenger.create({
        roomId,
        messages: [messageData],
      });
    } else {
      messenger.messages.push(messageData);
      await messenger.save();
    }

    const populatedMessenger = await Messenger.findOne({ roomId })
      .populate("messages.sender")
      .exec();

    const savedMessage = populatedMessenger.messages[populatedMessenger.messages.length - 1];

    io.to(roomId).emit("receive-message", {
      roomId,
      message: savedMessage?.text,
      sender: savedMessage?.sender,
      timestamp: savedMessage?.createdAt,
    });
  } catch (err) {
    console.error("Error in handleMessenger:", err);
    socket.emit("error", { message: "Failed to send message" });
  }
};

module.exports = handleMessenger;