const surveyRepo = require("../repositories/SurveyRepository");
const { Survey, SurveyQuestion, SurveyQuestionOption, SurveyResponse, SurveyAnswer } = require("../models");
const { sequelize } = require("../models");

class SurveyService {
  async create(data) {
    const { questions, ...surveyData } = data;
    const t = await sequelize.transaction();
    try {
      const survey = await Survey.create(surveyData, { transaction: t });

      if (questions && questions.length > 0) {
        const createdQuestions = [];
        // İlk geçiş: tüm soru ve seçenekleri oluştur
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];

          const question = await SurveyQuestion.create({
            surveyId: survey.id,
            questionNumber: q.orderNumber || i + 1,
            text: q.text,
            type: q.type,
            isRequired: q.isRequired || false,
            hasOther: q.hasOther || false,
            conditionalParentId: null,
            conditionalValue: null
          }, { transaction: t });

          const createdOptions = [];
          if (q.options && q.options.length > 0) {
            for (let j = 0; j < q.options.length; j++) {
              const opt = await SurveyQuestionOption.create({
                questionId: question.id,
                optionNumber: q.options[j].optionNumber || j + 1,
                optionText: q.options[j].optionText || q.options[j].text || ''
              }, { transaction: t });
              createdOptions.push(opt);
            }
          }

          createdQuestions.push({ question, options: createdOptions, raw: q });
        }

        // İkinci geçiş: koşullu soruları güncelle (gerçek ID'lerle)
        for (const item of createdQuestions) {
          const q = item.raw;
          if (q.conditionalParentIndex !== undefined && q.conditionalParentIndex !== null) {
            const parent = createdQuestions[q.conditionalParentIndex];
            if (parent) {
              const optNum = parseInt(q.conditionalValue) || 1;
              const matchedOpt = parent.options.find(o => o.optionNumber === optNum) || parent.options[optNum - 1];
              await item.question.update({
                conditionalParentId: parent.question.id,
                conditionalValue: matchedOpt ? String(matchedOpt.id) : q.conditionalValue
              }, { transaction: t });
            }
          } else if (q.conditionalParentId) {
            await item.question.update({
              conditionalParentId: q.conditionalParentId,
              conditionalValue: q.conditionalValue || null
            }, { transaction: t });
          }
        }
      }

      await t.commit();
      return surveyRepo.findWithDetails(survey.id);
    } catch (err) {
      await t.rollback();
      throw err;
    }
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
    const t = await sequelize.transaction();
    try {
      const response = await SurveyResponse.create({
        surveyId: survey_id,
        userId: user_id,
        completedAt: new Date()
      }, { transaction: t });

      // answers can be { questionId: value } object or array of { question_id, answer_value }
      if (Array.isArray(answers)) {
        for (const answer of answers) {
          await SurveyAnswer.create({
            responseId: response.id,
            questionId: answer.question_id || answer.questionId,
            answerType: answer.answer_type || answer.answerType || 'text',
            answerValue: String(answer.answer_value || answer.answerValue || '')
          }, { transaction: t });
        }
      } else if (typeof answers === 'object') {
        for (const [questionId, value] of Object.entries(answers)) {
          const answerValue = Array.isArray(value) ? JSON.stringify(value) : String(value);
          await SurveyAnswer.create({
            responseId: response.id,
            questionId: parseInt(questionId),
            answerType: typeof value === 'number' ? 'rating' : 'text',
            answerValue
          }, { transaction: t });
        }
      }

      await t.commit();
      return response;
    } catch (err) {
      await t.rollback();
      throw err;
    }
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
