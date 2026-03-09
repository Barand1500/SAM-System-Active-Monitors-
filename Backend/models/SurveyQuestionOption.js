module.exports = (sequelize, DataTypes) => {
  const SurveyQuestionOption = sequelize.define("SurveyQuestionOption", {

    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    questionId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "question_id"
    },

    optionNumber: {
      type: DataTypes.INTEGER,
      field: "option_number"
    },

    optionText: {
      type: DataTypes.STRING(255),
      field: "option_text"
    },

    optionValue: {
      type: DataTypes.INTEGER,
      field: "option_value"
    }

  }, {
    tableName: "survey_question_options",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });

  return SurveyQuestionOption;
};
