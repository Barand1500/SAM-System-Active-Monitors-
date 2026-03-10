const BaseRepository = require("./BaseRepository");
const { Survey, SurveyQuestion, SurveyQuestionOption, SurveyResponse, SurveyAnswer, User } = require("../models");

class SurveyRepository extends BaseRepository {
  constructor() {
    super(Survey);
  }

  async findByCompany(company_id) {
    return this.model.findAll({
      where: { company_id },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
        {
          model: SurveyQuestion,
          include: [SurveyQuestionOption]
        },
        {
          model: SurveyResponse,
          include: [SurveyAnswer]
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async findWithDetails(id) {
    return this.model.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
        {
          model: SurveyQuestion,
          include: [SurveyQuestionOption]
        },
        {
          model: SurveyResponse,
          include: [SurveyAnswer]
        }
      ]
    });
  }

  async findResponses(survey_id) {
    return SurveyResponse.findAll({
      where: { survey_id },
      include: [
        {
          model: SurveyAnswer,
          include: [SurveyQuestion]
        }
      ]
    });
  }

  async getStats(survey_id) {
    const responses = await SurveyResponse.count({ where: { survey_id } });
    const avgCompletion = await SurveyResponse.findOne({
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').fn('DATEDIFF', require('sequelize').col('completed_at'), require('sequelize').col('created_at'))), 'avgDays']
      ],
      where: { survey_id, completed_at: { [require('sequelize').Op.not]: null } }
    });

    return {
      totalResponses: responses,
      avgCompletionDays: avgCompletion?.dataValues?.avgDays || 0
    };
  }
}

module.exports = new SurveyRepository();
