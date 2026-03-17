const SurveyService = require("../services/SurveyService");
const { createForCompany } = require("../utils/notificationDispatcher");

class SurveyController {
  async create(req, res) {
    try {
      const survey = await SurveyService.create({
        ...req.body,
        companyId: req.user.company_id,
        createdBy: req.user.id
      });
      await createForCompany(req, {
        title: 'Yeni anket oluşturuldu',
        message: survey?.title ? `Anket: ${survey.title}` : 'Katılımınız beklenen yeni bir anket yayınlandı.',
        type: 'survey',
        referenceType: 'survey',
        referenceId: survey?.id,
        excludeUserId: req.user.id,
      });
      res.status(201).json(survey);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async list(req, res) {
    try {
      const surveys = await SurveyService.getByCompany(req.user.company_id);
      res.json(surveys);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async get(req, res) {
    try {
      const survey = await SurveyService.getById(req.params.id, req.user.company_id);
      res.json(survey);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const survey = await SurveyService.update(req.params.id, req.body, req.user.company_id);
      res.json(survey);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await SurveyService.delete(req.params.id, req.user.company_id);
      res.json({ message: "Anket başarıyla silindi" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async addQuestion(req, res) {
    try {
      const question = await SurveyService.addQuestion(req.params.id, req.body);
      res.status(201).json(question);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async updateQuestion(req, res) {
    try {
      const question = await SurveyService.updateQuestion(req.params.questionId, req.body);
      res.json(question);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async deleteQuestion(req, res) {
    try {
      await SurveyService.deleteQuestion(req.params.questionId);
      res.json({ message: "Soru başarıyla silindi" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async addOption(req, res) {
    try {
      const option = await SurveyService.addOption(req.params.questionId, req.body.option_text);
      res.status(201).json(option);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async submitResponse(req, res) {
    try {
      const response = await SurveyService.submitResponse(
        req.params.id,
        req.user.id,
        req.body.answers
      );
      res.status(201).json(response);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getResponses(req, res) {
    try {
      const responses = await SurveyService.getResponses(req.params.id, req.user.company_id);
      res.json(responses);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await SurveyService.getStats(req.params.id, req.user.company_id);
      res.json(stats);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new SurveyController();
