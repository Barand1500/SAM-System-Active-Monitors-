// Backend/routes/users.js
const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const { authenticate } = require("../middleware/authMiddleware");

// User CRUD
router.get("/", authenticate, UserController.list);
router.get("/:id", authenticate, UserController.get);
router.post("/", authenticate, UserController.create);
router.put("/:id", authenticate, UserController.update);

module.exports = router;