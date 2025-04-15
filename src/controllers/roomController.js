const Room = require("../models/RoomSchema");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Создание новой комнаты
exports.createRoom = async (req, res) => {
  try {
    const { name, password_room } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Room name is required" });
    }

    const roomData = {
      name,
      creator: req.user._id,
      members: [req.user._id],
    };

    // Хешируем пароль, если он предоставлен
    if (password_room) {
      roomData.password_room = await bcrypt.hash(password_room, 10);
    }

    const room = await Room.create(roomData);
    const populatedRoom = await Room.findById(room._id).populate(
      "creator members",
      "name email"
    );

    res.status(201).json({ success: true, data: populatedRoom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Получение всех комнат пользователя
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id }).populate(
      "creator members",
      "name email"
    );
    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
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
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Обновление комнаты
exports.updateRoom = async (req, res) => {
  try {
    const { name, password_room } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (password_room) {
      updateData.password_room = await bcrypt.hash(password_room, 10);
    }

    const room = await Room.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate("creator members", "name email");

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Удаление комнаты
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Генерация инвайт-ссылки
exports.generateInvite = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    // Проверяем, является ли пользователь создателем или участником
    if (
      !room.creator.equals(req.user._id) &&
      !room.members.includes(req.user._id)
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    room.inviteToken = token;
    await room.save();

    res.status(200).json({
      success: true,
      data: { inviteLink: `${process.env.APP_URL}/join/${token}` },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Присоединение к комнате по инвайт-токену
exports.joinRoom = async (req, res) => {
  try {
    const { password_room } = req.body;
    const room = await Room.findOne({ inviteToken: req.params.token });
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid invite token" });
    }

    // Проверка пароля, если он установлен
    if (room.password_room) {
      if (!password_room) {
        return res
          .status(400)
          .json({ success: false, message: "Password is required" });
      }
      const isMatch = await bcrypt.compare(password_room, room.password_room);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid password" });
      }
    }

    // Добавляем пользователя в участники, если его там еще нет
    if (!room.members.includes(req.user._id)) {
      room.members.push(req.user._id);
      await room.save();
    }

    const populatedRoom = await Room.findById(room._id).populate(
      "creator members",
      "name email"
    );

    res.status(200).json({ success: true, data: populatedRoom });
  } catch (error) {
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
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }
    res.status(200).json({ success: true, data: room.members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Добавление участника в комнату
exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    // Проверяем, является ли текущий пользователь создателем
    if (!room.creator.equals(req.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: "Only creator can add members" });
    }

    // Проверяем, существует ли пользователь
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// Удаление участника из комнаты
exports.removeMember = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    // Проверяем, является ли текущий пользователь создателем
    if (!room.creator.equals(req.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: "Only creator can remove members" });
    }

    // Проверяем, существует ли пользователь
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Удаляем пользователя из списка участников
    room.members = room.members.filter(
      (member) => member.toString() !== req.params.userId
    );
    await room.save();

    res
      .status(200)
      .json({ success: true, message: "Member removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};