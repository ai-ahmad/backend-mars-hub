const crudCreator = require("../services/crudCreator");
const Messenger = require("../models/messangerModel");
const userModel = require("../models/userModel");

const messengerController = crudCreator(Messenger, {
  populateFields: ["messages"],
});

const getMessages = async (req, res) => {
  try {
    const messengers = await Messenger.find();

    const populatedMessengers = await Promise.all(
      messengers.map(async (messenger) => {
        const roomUsers = messenger.roomId.split("-");

        const user1 = await userModel
          .findById(roomUsers[0])
          .select("_id username profileImage firstName lastName");

        const user2 = await userModel
          .findById(roomUsers[1])
          .select("_id username profileImage firstName lastName");

        return {
          ...messenger.toObject(),
          user1,
          user2,
        };
      })
    );

    res.status(200).json(populatedMessengers);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { messengerController, getMessages };
