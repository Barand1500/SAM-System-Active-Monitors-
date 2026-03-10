const express = require("express");
const router = express.Router();
const PersonalNoteController = require("../controllers/PersonalNoteController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/", authenticate, PersonalNoteController.list);
router.post("/", authenticate, PersonalNoteController.create);
router.put("/:id", authenticate, PersonalNoteController.update);
router.delete("/:id", authenticate, PersonalNoteController.delete);

module.exports = router;
