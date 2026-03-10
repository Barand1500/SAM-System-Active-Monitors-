const express = require("express");
const router = express.Router();
const contactController = require("../controllers/ContactController");
const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/", contactController.list);
router.post("/", contactController.create);
router.put("/:id", contactController.update);
router.delete("/:id", contactController.delete);

module.exports = router;
