const express = require("express");
const router = express.Router();
const WorkspaceController = require("../controllers/WorkspaceController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const companyIsolation = require("../middleware/companyIsolation");

router.get("/", authenticate, companyIsolation, WorkspaceController.list);
router.get("/:id", authenticate, companyIsolation, WorkspaceController.get);
router.post("/", authenticate, companyIsolation, authorizeRoles("boss", "manager"), WorkspaceController.create);
router.put("/:id", authenticate, companyIsolation, authorizeRoles("boss", "manager"), WorkspaceController.update);
router.delete("/:id", authenticate, companyIsolation, authorizeRoles("boss", "manager"), WorkspaceController.delete);

// Members
router.post("/:id/members", authenticate, companyIsolation, authorizeRoles("boss", "manager"), WorkspaceController.addMember);
router.delete("/:id/members/:userId", authenticate, companyIsolation, authorizeRoles("boss", "manager"), WorkspaceController.removeMember);

module.exports = router;
