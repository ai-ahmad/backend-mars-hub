const express = require("express");
const router = express.Router();
const {messengerController, getMessages} = require("../controllers/messangerController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", getMessages);
router.get("/:id", messengerController.getOne);
router.post("/", authMiddleware, messengerController.create);
router.put("/:id", authMiddleware, messengerController.update);
router.delete("/:id", authMiddleware, messengerController.remove);

module.exports = router;
