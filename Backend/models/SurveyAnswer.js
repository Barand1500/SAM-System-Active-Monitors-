module.exports = (sequelize, DataTypes) => {
  const SurveyAnswer = sequelize.define("SurveyAnswer", {

    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    responseId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "response_id"
    },

    questionId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "question_id"
    },

    answerType: {
      type: DataTypes.STRING(50),
      field: "answer_type"
    },

    answerValue: {
      type: DataTypes.TEXT,
      field: "answer_value"
    }

  }, {
    tableName: "survey_answers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });

  return SurveyAnswer;
};
