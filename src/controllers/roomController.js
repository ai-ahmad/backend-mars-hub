const Room = require("../models/RoomSchema");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Создание новой комнаты
exports.createRoom = async (req, res) => {
  try {
    const { name, password_room, creatorId } = req.body;
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Room name is required and must be a non-empty string" });
    }
    if (!creatorId) {
      return res.status(400).json({ success: false, message: "Creator ID is required" });
    }

    // Validate creatorId exists in User collection
    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ success: false, message: "Creator not found" });
    }

    const roomData = {
      name: name.trim(),
      creator: creatorId,
      members: [creatorId],
    };

    // Хешируем пароль, если он предоставлен
    if (password_room) {
      if (typeof password_room !== "string" || password_room.length < 4) {
        return res.status(400).json({ success: false, message: "Password must be a string with at least 4 characters" });
      }
      roomData.password_room = await bcrypt.hash(password_room, 10);
    }

    const room = await Room.create(roomData);
    console.log(`Room created: ${room._id}`);

    const populatedRoom = await Room.findById(room._id).populate(
      "creator members",
      "name email"
    );

    if (!populatedRoom) {
      console.error(`Failed to populate room: ${room._id}`);
      return res.status(500).json({ success: false, message: "Failed to retrieve room details" });
    }

    res.status(201).json({ success: true, data: populatedRoom });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
  }
};

// Получение всех комнат по creatorId
exports.getRooms = async (req, res) => {
  try {
    const { creatorId } = req.query;
    if (!creatorId) {
      return res.status(400).json({ success: false, message: "Creator ID is required" });
    }

    const rooms = await Room.find({ members: creatorId }).populate(
      "creator members",
      "name email"
    );
    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Получение комнаты по ID
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate(
      "creator members",
      "name email"
    );
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    console.error("Get room error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Обновление комнаты
exports.updateRoom = async (req, res) => {
  try {
    const { name, password_room, creatorId } = req.body;
    if (!creatorId) {
      return res.status(400).json({ success: false, message: "Creator ID is required" });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    // Check if creatorId matches room creator
    if (room.creator.toString() !== creatorId) {
      return res.status(403).json({ success: false, message: "Only the creator can update the room" });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (password_room) {
      updateData.password_room = await bcrypt.hash(password_room, 10);
    }

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate("creator members", "name email");

    res.status(200).json({ success: true, data: updatedRoom });
  } catch (error) {
    console.error("Update room error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Удаление комнаты
exports.deleteRoom = async (req, res) => {
  try {
    const { creatorId } = req.query;
    if (!creatorId) {
      return res.status(400).json({ success: false, message: "Creator ID is required" });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    // Check if creatorId matches room creator
    if (room.creator.toString() !== creatorId) {
      return res.status(403).json({ success: false, message: "Only the creator can delete the room" });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    console.error("Delete room error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Генерация инвайт-ссылки
exports.generateInvite = async (req, res) => {
  try {
    const { creatorId } = req.query;
    if (!creatorId) {
      return res.status(400).json({ success: false, message: "Creator ID is required" });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    // Check if creatorId matches room creator or member
    if (room.creator.toString() !== creatorId && !room.members.includes(creatorId)) {
      return res.status(403).json({ success: false, message: "Only creator or members can generate invite links" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    room.inviteToken = token;
    await room.save();

    res.status(200).json({
      success: true,
      data: { inviteLink: `${process.env.APP_URL}/join/${token}` },
    });
  } catch (error) {
    console.error("Generate invite error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Присоединение к комнате по инвайт-токену
exports.joinRoom = async (req, res) => {
  try {
    const { password_room, userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Validate userId exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const room = await Room.findOne({ inviteToken: req.params.token });
    if (!room) {
      return res.status(404).json({ success: false, message: "Invalid invite token" });
    }

    // Проверка пароля, если он установлен
    if (room.password_room) {
      if (!password_room) {
        return res.status(400).json({ success: false, message: "Password is required" });
      }
      const isMatch = await bcrypt.compare(password_room, room.password_room);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid password" });
      }
    }

    // Добавляем пользователя в участники, если его там еще нет
    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    const populatedRoom = await Room.findById(room._id).populate(
      "creator members",
      "name email"
    );

    res.status(200).json({ success: true, data: populatedRoom });
  } catch (error) {
    console.error("Join room error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Получение списка участников комнаты
exports.getMembers = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate(
      "creator members",
      "name email"
    );
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }
    res.status(200).json({ success: true, data: room.members });
  } catch (error) {
    console.error("Get members error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Добавление участника в комнату
exports.addMember = async (req, res) => {
  try {
    const { userId, creatorId } = req.body;
    if (!userId || !creatorId) {
      return res.status(400).json({ success: false, message: "User ID and Creator ID are required" });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    // Проверяем, является ли creatorId создателем
    if (room.creator.toString() !== creatorId) {
      return res.status(403).json({ success: false, message: "Only creator can add members" });
    }

    // Проверяем, существует ли пользователь
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Добавляем пользователя, если его еще нет
    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    const populatedRoom = await Room.findById(room._id).populate(
      "creator members",
      "name email"
    );

    res.status(200).json({ success: true, data: populatedRoom });
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Удаление участника из комнаты
exports.removeMember = async (req, res) => {
  try {
    const { creatorId } = req.query;
    if (!creatorId) {
      return res.status(400).json({ success: false, message: "Creator ID is required" });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    // Проверяем, является ли creatorId создателем
    if (room.creator.toString() !== creatorId) {
      return res.status(403).json({ success: false, message: "Only creator can remove members" });
    }

    // Проверяем, существует ли пользователь
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Удаляем пользователя из списка участников
    room.members = room.members.filter(
      (member) => member.toString() !== req.params.userId
    );
    await room.save();

    res.status(200).json({ success: true, message: "Member removed successfully" });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};