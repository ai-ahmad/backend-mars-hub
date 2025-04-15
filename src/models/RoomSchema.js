const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  password_room: {
    type: String, // Исправлено с 'string' на 'String'
    required: false, // Пароль необязательный, если не указано иное
  },
  inviteToken: {
    type: String,
    unique: true, // Для инвайт-ссылок
  },
});

module.exports = mongoose.model("Room", RoomSchema);