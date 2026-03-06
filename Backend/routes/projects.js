const express = require("express");
const router = express.Router();
const ProjectController = require("../controllers/ProjectController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/workspace/:workspaceId", authenticate, ProjectController.list);
router.get("/:id", authenticate, ProjectController.get);
router.post("/", authenticate, ProjectController.create);
router.put("/:id", authenticate, ProjectController.update);
router.delete("/:id", authenticate, ProjectController.delete);

// Members
router.post("/:id/members", authenticate, ProjectController.addMember);
router.delete("/:id/members/:userId", authenticate, ProjectController.removeMember);

module.exports = router;
