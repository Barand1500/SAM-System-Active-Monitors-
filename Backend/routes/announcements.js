const express = require("express");
const router = express.Router();
const AnnouncementController = require("../controllers/AnnouncementController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const companyIsolation = require("../middleware/companyIsolation");

router.use(authenticate, companyIsolation);

router.get("/", AnnouncementController.list);
router.post("/", authorizeRoles("boss", "manager"), AnnouncementController.create);
router.put("/:id", authorizeRoles("boss", "manager"), AnnouncementController.update);
router.delete("/:id", authorizeRoles("boss", "manager"), AnnouncementController.delete);

module.exports = router;
