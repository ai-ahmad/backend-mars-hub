const express = require("express");
const router = express.Router();
const messengerController = require("../controllers/messangerController");

router.get("/", messengerController.getAll);
router.get("/:id", messengerController.getOne);
router.post("/", messengerController.create);
router.put("/:id", messengerController.update);
router.delete("/:id", messengerController.remove);

module.exports = router;
