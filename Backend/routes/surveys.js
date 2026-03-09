const express = require("express");
const router = express.Router();
const SurveyController = require("../controllers/SurveyController");
const { authenticate } = require("../middleware/authMiddleware");
const companyIsolation = require("../middleware/companyIsolation");

// Survey CRUD
router.get("/", authenticate, companyIsolation, SurveyController.list);
router.post("/", authenticate, companyIsolation, SurveyController.create);
router.get("/:id", authenticate, companyIsolation, SurveyController.get);
router.put("/:id", authenticate, companyIsolation, SurveyController.update);
router.delete("/:id", authenticate, companyIsolation, SurveyController.delete);

// Questions
router.post("/:id/questions", authenticate, companyIsolation, SurveyController.addQuestion);
router.put("/:id/questions/:questionId", authenticate, companyIsolation, SurveyController.updateQuestion);
router.delete("/:id/questions/:questionId", authenticate, companyIsolation, SurveyController.deleteQuestion);

// Question Options
router.post("/:id/questions/:questionId/options", authenticate, companyIsolation, SurveyController.addOption);

// Responses
router.post("/:id/submit", authenticate, companyIsolation, SurveyController.submitResponse);
router.get("/:id/responses", authenticate, companyIsolation, SurveyController.getResponses);

// Stats
router.get("/:id/stats", authenticate, companyIsolation, SurveyController.getStats);

module.exports = router;
