const express = require("express");
const router = express.Router();
const ProjectController = require("../controllers/ProjectController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const companyIsolation = require("../middleware/companyIsolation");

router.use(authenticate, companyIsolation);

router.get("/workspace/:workspaceId", ProjectController.list);
router.get("/:id", ProjectController.get);
router.post("/", authorizeRoles("boss", "manager"), ProjectController.create);
router.put("/:id", authorizeRoles("boss", "manager"), ProjectController.update);
router.delete("/:id", authorizeRoles("boss", "manager"), ProjectController.delete);

// Members
router.post("/:id/members", authorizeRoles("boss", "manager"), ProjectController.addMember);
router.delete("/:id/members/:userId", authorizeRoles("boss", "manager"), ProjectController.removeMember);

module.exports = router;
