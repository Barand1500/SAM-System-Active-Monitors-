const express = require("express");
const router = express.Router();
const dashboardSettingController = require("../controllers/DashboardSettingController");
const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/", dashboardSettingController.get);
router.put("/", dashboardSettingController.update);

module.exports = router;
