const express = require("express");
const router = express.Router();
const DepartmentController = require("../controllers/DepartmentController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/", authenticate, DepartmentController.list);
router.get("/:id", authenticate, DepartmentController.get);
router.post("/", authenticate, DepartmentController.create);
router.put("/:id", authenticate, DepartmentController.update);
router.delete("/:id", authenticate, DepartmentController.delete);

module.exports = router;
