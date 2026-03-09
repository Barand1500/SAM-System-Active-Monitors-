const surveyRepo = require("../repositories/SurveyRepository");
const { Survey, SurveyQuestion, SurveyQuestionOption, SurveyResponse, SurveyAnswer } = require("../models");

class SurveyService {
  async create(data) {
    return surveyRepo.create(data);
  }

  async getByCompany(company_id) {
    return surveyRepo.findByCompany(company_id);
  }

  async getById(id, company_id) {
    const survey = await surveyRepo.findWithDetails(id);
    if (!survey || survey.company_id !== company_id) {
      throw new Error("Survey not found");
    }
    return survey;
  }

  async update(id, data, company_id) {
    return surveyRepo.update(id, data, company_id);
  }

  async delete(id, company_id) {
    return surveyRepo.delete(id, company_id);
  }

  async addQuestion(survey_id, questionData) {
    return SurveyQuestion.create({
      survey_id,
      ...questionData
    });
  }

  async updateQuestion(question_id, data) {
    const question = await SurveyQuestion.findByPk(question_id);
    if (!question) throw new Error("Question not found");
    return question.update(data);
  }

  async deleteQuestion(question_id) {
    const question = await SurveyQuestion.findByPk(question_id);
    if (!question) throw new Error("Question not found");
    return question.destroy();
  }

  async addOption(question_id, optionText) {
    return SurveyQuestionOption.create({
      question_id,
      option_text: optionText
    });
  }

  async submitResponse(survey_id, user_id, answers) {
    const response = await SurveyResponse.create({
      survey_id,
      user_id,
      completed_at: new Date()
    });

    for (const answer of answers) {
      await SurveyAnswer.create({
        response_id: response.id,
        question_id: answer.question_id,
        answer_type: answer.answer_type,
        answer_value: answer.answer_value
      });
    }

    return response;
  }

  async getResponses(survey_id, company_id) {
    const survey = await Survey.findByPk(survey_id);
    if (!survey || survey.company_id !== company_id) {
      throw new Error("Survey not found");
    }
    return surveyRepo.findResponses(survey_id);
  }

  async getStats(survey_id, company_id) {
    const survey = await Survey.findByPk(survey_id);
    if (!survey || survey.company_id !== company_id) {
      throw new Error("Survey not found");
    }
    return surveyRepo.getStats(survey_id);
  }
}

module.exports = new SurveyService();
