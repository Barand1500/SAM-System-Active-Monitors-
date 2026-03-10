const express = require("express");
const router = express.Router();
const CustomerController = require("../controllers/CustomerController");
const { authenticate } = require("../middleware/authMiddleware");
const companyIsolation = require("../middleware/companyIsolation");

router.get("/", authenticate, companyIsolation, CustomerController.list);
router.post("/", authenticate, companyIsolation, CustomerController.create);
router.get("/:id", authenticate, companyIsolation, CustomerController.get);
router.put("/:id", authenticate, companyIsolation, CustomerController.update);
router.delete("/:id", authenticate, companyIsolation, CustomerController.delete);

module.exports = router;
