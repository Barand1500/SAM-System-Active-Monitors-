const express = require("express");
const router = express.Router();
const AnnouncementController = require("../controllers/AnnouncementController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/", authenticate, AnnouncementController.list);
router.post("/", authenticate, AnnouncementController.create);
router.put("/:id", authenticate, AnnouncementController.update);
router.delete("/:id", authenticate, AnnouncementController.delete);

module.exports = router;
