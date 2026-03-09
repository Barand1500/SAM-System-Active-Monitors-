module.exports = (sequelize, DataTypes) => {
  const SurveyResponse = sequelize.define("SurveyResponse", {

    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    surveyId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "survey_id"
    },

    userId: {
      type: DataTypes.BIGINT,
      field: "user_id"
    },

    completedAt: {
      type: DataTypes.DATE,
      field: "completed_at"
    }

  }, {
    tableName: "survey_responses",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });

  return SurveyResponse;
};
