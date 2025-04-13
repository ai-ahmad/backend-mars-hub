const handleMessenger = async (io, socket, roomId, message, sender) => {
  if (!roomId || !message || !sender) {
    return socket.emit("error", { message: "Invalid roomId or message or sender" });
  }

  const messageData = {
    roomId,
    message,
    sender,
    timestamp: new Date(),
  };

  io.to(roomId).emit("receive-message", messageData);
};

module.exports = handleMessenger;
