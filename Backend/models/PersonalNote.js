module.exports = (sequelize, DataTypes) => {
  const PersonalNote = sequelize.define("PersonalNote", {

    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "user_id"
    },

    companyId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "company_id"
    },

    noteDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "note_date"
    },

    text: {
      type: DataTypes.TEXT,
      allowNull: false
    }

  }, {
    tableName: "personal_notes",
    timestamps: true,
    underscored: true
  });

  return PersonalNote;
};
