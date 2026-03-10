module.exports = (sequelize, DataTypes) => {
  const SurveyQuestion = sequelize.define("SurveyQuestion", {

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

    questionNumber: {
      type: DataTypes.INTEGER,
      field: "question_number"
    },

    text: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    type: {
      type: DataTypes.ENUM(
        "multiple_choice",
        "checkboxes",
        "short_answer",
        "long_answer",
        "rating",
        "matrix",
        "single",
        "multiple",
        "text",
        "yesno"
      ),
      allowNull: false
    },

    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_required"
    },

    hasOther: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "has_other"
    },

    conditionalParentId: {
      type: DataTypes.BIGINT,
      field: "conditional_parent_id"
    },

    conditionalValue: {
      type: DataTypes.STRING(100),
      field: "conditional_value"
    }

  }, {
    tableName: "survey_questions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  });

  return SurveyQuestion;
};
