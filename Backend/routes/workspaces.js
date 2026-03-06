const express = require("express");
const router = express.Router();
const WorkspaceController = require("../controllers/WorkspaceController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/", authenticate, WorkspaceController.list);
router.get("/:id", authenticate, WorkspaceController.get);
router.post("/", authenticate, WorkspaceController.create);
router.put("/:id", authenticate, WorkspaceController.update);
router.delete("/:id", authenticate, WorkspaceController.delete);

// Members
router.post("/:id/members", authenticate, WorkspaceController.addMember);
router.delete("/:id/members/:userId", authenticate, WorkspaceController.removeMember);

module.exports = router;
