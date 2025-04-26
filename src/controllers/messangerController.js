const crudCreator = require("../services/crudCreator");
const Messenger = require("../models/messangerModel");

const messengerController = crudCreator(Messenger, {
  populateFields: ["messages.sender"],
});

module.exports = messengerController;
