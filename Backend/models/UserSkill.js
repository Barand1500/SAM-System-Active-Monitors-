module.exports = (sequelize, DataTypes) => {
  const UserSkill = sequelize.define("UserSkill", {
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

    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    category: DataTypes.STRING(100),

    level: {
      type: DataTypes.ENUM("beginner","intermediate","advanced","expert"),
      defaultValue: "intermediate"
    }

  }, {
    tableName: "user_skills",
    timestamps: false
  });

  return UserSkill;
};